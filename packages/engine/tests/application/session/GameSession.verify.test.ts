import { DEFAULT_OPTIONS, makeCatalog } from './fixtures';
import { eventDrewCards } from '@engine/application/aggregates/GameAggregate';
import { shuffle } from '@engine/application/random';
import {
  GameSession,
  UnverifiedGameError,
  checkpointSeq,
} from '@engine/application/session/GameSession';
import { ActionEffectType, GameEventType, Phase, Trigger } from '@engine/domain/enums';
import type {
  CardActionEvent,
  GameCatalog,
  GameCheckpoint,
  GameEvent,
  ResolvedActionEffect,
  RoundStartedEvent,
  TurnStartedEvent,
} from '@engine/domain/types';
import { describe, expect, it } from 'vitest';

const WORKSHOP = 9;
const TUTORIAL_ORDER = [1, 5, 9, 10, 2, 3, 4, 6, 7, 8];

/** Fields (card 1) get an optional on-play trigger. */
function catalog(): GameCatalog {
  const base = makeCatalog();
  const [field, farm] = base.cards[1].states;
  base.cards[1] = {
    ...base.cards[1],
    states: [
      {
        ...field,
        actions: [
          {
            id: '1-1-1',
            trigger: Trigger.ON_PLAY,
            optional: true,
            actionEffects: [
              { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 1 } },
            ],
          },
        ],
      },
      farm,
    ],
  };
  return { ...base, tutorialDrawOrder: TUTORIAL_ORDER };
}

/** Plays `steps` commands: triggers (resolved or skipped), productions, then turn and round ends. */
function play(session: GameSession, steps: number): void {
  for (let step = 0; step < steps; step++) {
    const state = session.getState();
    const [triggerId] = Object.keys(state.triggerPile);
    // Only fields produce: workshops have no production to resolve.
    const field = state.board.find(id => state.instances[id].cardId === 1);
    if (state.phase === Phase.GAME_OVER) return;
    if (triggerId) {
      const entry = state.triggerPile[triggerId];
      session.execute(
        step % 2 === 0
          ? { type: 'skipTrigger', triggerId }
          : {
              type: 'resolveAction',
              instanceId: entry.sourceInstanceId,
              actionId: entry.effectDef.id,
              triggerId,
            },
      );
    } else if (state.phase === Phase.PLAYING && state.board.length > 1 && field !== undefined) {
      session.execute({ type: 'resolveProduction', instanceId: field, choiceIndex: 0 });
    } else if (state.phase === Phase.PLAYING) {
      session.execute({ type: 'endTurn' });
    } else if (state.phase === Phase.TURN_END) {
      session.execute({ type: 'startTurn' });
    } else if (state.phase === Phase.ROUND_END) {
      session.execute({ type: 'endRound' });
    } else {
      session.execute({ type: 'startRound' });
    }
  }
}

/** Events as they come back from storage or the database: a JSON copy. */
function stored(events: GameEvent[]): GameEvent[] {
  return JSON.parse(JSON.stringify(events)) as GameEvent[];
}

function verify(events: GameEvent[], data = catalog()) {
  return GameSession.verify('g', stored(events), data);
}

describe('seeded shuffles', () => {
  it('only depend on the seed, the salt and the cards', () => {
    const cards = [1, 2, 3, 4, 5, 6, 7, 8];

    expect(shuffle(cards, 'seed', 'a')).toEqual(shuffle(cards, 'seed', 'a'));
    expect(shuffle(cards, 'seed', 'a')).not.toEqual(shuffle(cards, 'other', 'a'));
    expect([...shuffle(cards, 'seed', 'a')].sort((a, b) => a - b)).toEqual(cards);
    expect([...shuffle(cards)].sort((a, b) => a - b)).toEqual(cards);
  });

  it('start the same game from the same seed', () => {
    const a = GameSession.start('g', catalog(), DEFAULT_OPTIONS, 'standard', undefined, 's');
    const b = GameSession.start('g', catalog(), DEFAULT_OPTIONS, 'standard', undefined, 's');

    expect(a.getState().board).toEqual(b.getState().board);
    expect(a.getState().drawPile).toEqual(b.getState().drawPile);
    expect(a.getEvents()[0]).toMatchObject({ seed: 's' });
  });
});

describe('GameSession.verify', () => {
  it('accepts a game played through several rounds and gives the same score', () => {
    const session = GameSession.start('g', catalog(), DEFAULT_OPTIONS);
    play(session, 120);

    const verified = verify(session.getEvents());

    expect(session.getState().round).toBeGreaterThan(1);
    expect(verified?.getScore()).toBe(session.getScore());
    expect(verified?.getState().resources).toEqual(session.getState().resources);
  });

  it('records the commands on the first event they produced, with stable trigger references', () => {
    const session = GameSession.start('g', catalog(), DEFAULT_OPTIONS);
    play(session, 30);

    const recorded = session.getEvents().flatMap(event => event.commands ?? []);

    expect(session.getEvents()[0].commands).toBeUndefined();
    expect(recorded.length).toBeGreaterThan(0);
    for (const command of recorded) {
      if (command.type === 'skipTrigger') expect(command.triggerId).toMatch(/^@\d+\|1-1-1\|\d+$/);
    }
  });

  it('accepts multi-step actions, cancelled actions and rewinds', () => {
    const session = GameSession.start('g', catalog(), DEFAULT_OPTIONS, 'tutorial', TUTORIAL_ORDER);
    const continued = GameSession.restore('g', session.getEvents(), catalog(), DEFAULT_OPTIONS);
    while (Object.keys(continued.getState().triggerPile).length > 0) play(continued, 1);

    continued.execute({ type: 'resolveAction', instanceId: WORKSHOP, actionId: '2_1_2' });
    continued.execute({ type: 'skipChoice' });
    continued.execute({ type: 'resolveAction', instanceId: WORKSHOP, actionId: '2_1_1' });
    continued.execute({ type: 'rewind' });
    continued.execute({
      type: 'resolveAction',
      instanceId: WORKSHOP,
      actionId: '2_1_1',
      triggerId: 'unknown',
    });
    continued.execute({ type: 'resolveAction', instanceId: WORKSHOP, actionId: '2_1_2' });
    const [pending] = continued.toView().pendingChoices ?? [];
    continued.execute({
      type: 'resolvePlayerChoice',
      choice: { ...(pending as unknown as ResolvedActionEffect), instanceIds: [1] },
      choiceType: pending.type,
    });
    continued.execute({ type: 'resolveUpgrade', instanceId: 10, upgradeTo: 3 });
    continued.execute({
      type: 'resolvePayCost',
      resolved: { resources: {}, discardedCardIds: [5], destroyedCardIds: [] },
    });
    play(continued, 40);

    const verified = verify(continued.getEvents());

    expect(continued.getState().instances[10].stateId).toBe(3);
    expect(verified?.getScore()).toBe(continued.getScore());
  });

  it('accepts a game whose last events were rewound after a multi-event command', () => {
    const session = GameSession.start('g', catalog(), DEFAULT_OPTIONS);
    play(session, 10);
    for (let i = 0; i < 3 && session.canRewind(); i++) session.execute({ type: 'rewind' });

    expect(verify(session.getEvents())).not.toBeNull();
  });

  /** Command batches of a log: [first event, next recorded event). */
  function batches(events: GameEvent[]): [number, number][] {
    const starts = events.flatMap((event, index) => (event.commands ? [index] : []));
    return starts.map((start, i) => [start, starts[i + 1] ?? events.length]);
  }

  it('rewinds on the server the events the player rewound after a multi-event command', () => {
    const session = GameSession.start('g', catalog(), DEFAULT_OPTIONS);
    play(session, 60);
    const events = session.getEvents();
    const partial = batches(events).filter(([s, e]) => e - s > 1 && !eventDrewCards(events[e - 1]));
    const drawing = batches(events).filter(([s, e]) => e - s > 1 && eventDrewCards(events[e - 1]));
    const [, rewound] = partial[0];
    const [, drawn] = drawing[0];

    expect(verify(events.slice(0, rewound - 1))).not.toBeNull();
    expect(() => verify(events.slice(0, drawn - 1))).toThrow(UnverifiedGameError);
  });

  it('refuses recorded rewinds and commands that produce no event', () => {
    const session = GameSession.start('g', catalog(), DEFAULT_OPTIONS);
    play(session, 20);
    const [[index]] = batches(session.getEvents());
    const withRewind = stored(session.getEvents());
    withRewind[index].commands = [{ type: 'rewind' }];
    const withoutEvent = stored(session.getEvents());
    withoutEvent[index].commands = [{ type: 'skipChoice' }];

    expect(() => verify(withRewind)).toThrow(UnverifiedGameError);
    expect(() => verify(withoutEvent)).toThrow(UnverifiedGameError);
  });

  it('refuses forged resources', () => {
    const session = GameSession.start('g', catalog(), DEFAULT_OPTIONS);
    play(session, 40);
    const events = stored(session.getEvents());
    const action = events.find(e => e.type === GameEventType.CARD_ACTION) as CardActionEvent;
    action.gameStateChanges = { ...action.gameStateChanges, resources: { gold: 99 } };

    expect(() => verify(events)).toThrow(UnverifiedGameError);
  });

  it('refuses a chosen draw order', () => {
    const session = GameSession.start('g', catalog(), DEFAULT_OPTIONS);
    play(session, 60);
    const events = stored(session.getEvents());
    const rounds = events.filter(
      e => e.type === GameEventType.ROUND_STARTED,
    ) as RoundStartedEvent[];
    const last = rounds.at(-1);
    last?.newDrawPile.reverse();

    expect(rounds.length).toBeGreaterThan(1);
    expect(() => verify(events)).toThrow(UnverifiedGameError);
  });

  it('refuses events that no command produced', () => {
    const session = GameSession.start('g', catalog(), DEFAULT_OPTIONS);
    play(session, 20);
    const events = stored(session.getEvents());
    const { commands: _commands, ...unrecorded } = events[events.length - 1];
    const lastRecorded = events.findLastIndex(e => e.commands);
    events.splice(lastRecorded, 1, { ...events[lastRecorded], commands: undefined });

    expect(unrecorded.type).toBeDefined();
    expect(() => verify(events)).toThrow(UnverifiedGameError);
  });

  it('verifies a kept tutorial only with the catalog draw order', () => {
    const session = GameSession.start('g', catalog(), DEFAULT_OPTIONS, 'tutorial', TUTORIAL_ORDER);
    play(session, 20);

    expect(verify(session.getEvents())).not.toBeNull();
    expect(() =>
      verify(session.getEvents(), { ...catalog(), tutorialDrawOrder: undefined }),
    ).toThrow(UnverifiedGameError);
  });

  it('cannot verify games started without a seed', () => {
    const session = GameSession.start('g', catalog(), DEFAULT_OPTIONS);
    const { seed: _seed, ...legacyStart } = session.getEvents()[0] as GameEvent & { seed?: string };

    expect(verify([legacyStart, ...session.getEvents().slice(1)])).toBeNull();
  });
});

describe('checkpoints', () => {
  /** A game through several rounds and the checkpoint the server would keep for it. */
  function playedWithCheckpoint(): { events: GameEvent[]; checkpoint: GameCheckpoint } {
    const session = GameSession.start('g', catalog(), DEFAULT_OPTIONS);
    play(session, 120);
    const events = session.getEvents();
    const seq = checkpointSeq(events);
    const state = GameSession.restore('g', events.slice(0, seq), catalog(), DEFAULT_OPTIONS);
    // As read back from the database: a JSON copy.
    return { events, checkpoint: JSON.parse(JSON.stringify({ seq, state: state.getState() })) };
  }

  it('are placed after the first draw of the last round, before a recorded command', () => {
    const { events, checkpoint } = playedWithCheckpoint();
    const firstTurns = events
      .slice(0, checkpoint.seq)
      .filter(
        event =>
          event.type === GameEventType.TURN_STARTED && (event as TurnStartedEvent).turn === 1,
      );

    expect(checkpoint.seq).toBeGreaterThan(0);
    expect(events[checkpoint.seq].commands).toBeDefined();
    expect(firstTurns).toHaveLength(checkpoint.state.round);
    expect(checkpointSeq(events.slice(0, 3))).toBe(0);
  });

  it('let verify run only the commands after them, with the same result', () => {
    const { events, checkpoint } = playedWithCheckpoint();

    const resumed = GameSession.verify('g', stored(events), catalog(), checkpoint);

    expect(resumed?.getEvents()).toHaveLength(events.length);
    expect(resumed?.getScore()).toBe(verify(events)?.getScore());
    expect(resumed?.getState()).toEqual(verify(events)?.getState());
  });

  it('still refuse forged events after them', () => {
    const { events, checkpoint } = playedWithCheckpoint();
    const forged = stored(events);
    const last = forged.findLastIndex(event => event.type === GameEventType.CARD_ACTION);
    (forged[last] as CardActionEvent).gameStateChanges = { resources: { gold: 99 } };

    expect(last).toBeGreaterThanOrEqual(checkpoint.seq);
    expect(() => GameSession.verify('g', forged, catalog(), checkpoint)).toThrow(
      UnverifiedGameError,
    );
  });

  it('must end before a recorded command', () => {
    const { events, checkpoint } = playedWithCheckpoint();

    expect(() =>
      GameSession.verify('g', stored(events), catalog(), {
        ...checkpoint,
        seq: checkpoint.seq - 1,
      }),
    ).toThrow(UnverifiedGameError);
  });

  it('let restore resume from a corrected state', () => {
    const { events, checkpoint } = playedWithCheckpoint();
    const corrected = { ...checkpoint, state: { ...checkpoint.state, isLastRound: true } };

    const restored = GameSession.restore('g', events, catalog(), DEFAULT_OPTIONS, {}, corrected);

    expect(restored.getEvents()).toHaveLength(events.length);
    expect(restored.getState().isLastRound).toBe(true);
  });

  it('never let a rewind go back before them, even an unrestricted one', () => {
    const { events, checkpoint } = playedWithCheckpoint();
    const corrected = { ...checkpoint, state: { ...checkpoint.state, isLastRound: true } };
    const options = { ...DEFAULT_OPTIONS, unrestrictedRewind: true };
    const restored = GameSession.restore('g', events, catalog(), options, {}, corrected);

    while (restored.canRewind()) restored.execute({ type: 'rewind' });

    expect(restored.getEvents()).toHaveLength(checkpoint.seq);
    expect(restored.getState()).toEqual(corrected.state);
  });
});
