import { DEFAULT_OPTIONS, fieldCard, makeCatalog } from './fixtures';
import { GameSession } from '@engine/application/session/GameSession';
import { GameAggregate } from '@engine/domain/aggregates/GameAggregate';
import {
  ActionEffectType,
  GameEventType,
  PendingChoiceType,
  Phase,
  TargetScope,
} from '@engine/domain/enums';
import { CostResolutionError } from '@engine/domain/errors/CostResolutionError';
import { ForbiddenCommandError } from '@engine/domain/errors/ForbiddenCommandError';
import type { CardDef, GameCatalog, GameState, ResolvedCost } from '@engine/domain/types';
import { afterEach, describe, expect, it, vi } from 'vitest';

const discardOne = { scope: [TargetScope.BOARD], pickNumber: 1 };
const goldOrWood = [{ gold: 1 }, { wood: 1 }];

/** Paid with gold or wood: its action then discards a card, its upgrade also costs a card. */
const market: CardDef = {
  id: 3,
  name: 'Market',
  states: [
    {
      id: 1,
      name: 'Market',
      actions: [
        {
          id: 'trade',
          cost: { resources: goldOrWood },
          actionEffects: [{ id: 1, type: ActionEffectType.DISCARD_CARD, cards: discardOne }],
        },
      ],
      upgrade: [{ upgradeTo: 2, cost: { resources: goldOrWood, discard: [discardOne] } }],
    },
    { id: 2, name: 'Fair' },
  ],
};

/** A parchment: its action resolves when the player dismisses it. */
const decree: CardDef = {
  id: 5,
  name: 'Decree',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Decree',
      actions: [
        {
          id: '5-1-1',
          actionEffects: [{ id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } }],
        },
      ],
    },
  ],
};

/** Instances 2 and 9 are markets, 12 a parchment (to discover), the others fields. */
function catalog(): GameCatalog {
  return {
    ...makeCatalog(),
    cards: { 1: fieldCard, 3: market, 5: decree },
    campaign: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      cardId: ({ 1: 3, 8: 3, 11: 5 } as Record<number, number>)[i] ?? 1,
    })),
  };
}

/** The market (9) in play with fields 5 and 10; gold and wood to pay with. */
function marketSession(options = { ...DEFAULT_OPTIONS, allowCheats: true }) {
  const session = GameSession.start(
    'market',
    catalog(),
    options,
    'tutorial',
    [9, 1, 5, 10, 2, 3, 4, 6, 7, 8],
  );
  if (options.allowCheats) {
    session.execute({
      type: 'cheat',
      cheat: { op: 'addResources', resources: { gold: 1, wood: 1 } },
    });
  }
  return session;
}

/** The market game, resumed from its current state with some changes. */
function resumedWith(changes: Partial<GameState>) {
  const played = marketSession();
  const events = played.getEvents();
  const checkpoint = { seq: events.length, state: { ...played.getState(), ...changes } };
  return GameSession.restore('market', events, catalog(), DEFAULT_OPTIONS, {}, checkpoint);
}

const pay = (resolved: Partial<ResolvedCost>) => ({
  type: 'resolvePayCost' as const,
  resolved: { resources: {}, discardedCardIds: [], destroyedCardIds: [], ...resolved },
});

const pendingTypes = (session: GameSession) =>
  (session.toView().pendingChoices ?? []).map(choice => choice.type);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('refused commands', () => {
  it('throws on cheats when they are disabled', () => {
    const session = marketSession(DEFAULT_OPTIONS);

    expect(() =>
      session.execute({ type: 'cheat', cheat: { op: 'addResources', resources: { gold: 1 } } }),
    ).toThrow(ForbiddenCommandError);
  });

  it('ignores actions of unknown cards or cards out of play, and unknown triggers', () => {
    const session = marketSession();
    const events = session.getEvents().length;

    session.execute({ type: 'resolveAction', instanceId: 99, actionId: 'trade' });
    session.execute({ type: 'resolveAction', instanceId: 2, actionId: 'trade' });
    session.execute({ type: 'skipTrigger', triggerId: 'missing' });

    expect(session.getEvents()).toHaveLength(events);
  });

  it('cannot upgrade an equipped card', () => {
    const session = resumedWith({ equipped: { 9: 5 } });

    session.execute({ type: 'resolveUpgrade', instanceId: 9, upgradeTo: 2 });

    expect(session.toView().pendingChoices).toBeNull();
  });

  it('cancels a choice or a payment nothing waits for', () => {
    const session = marketSession();

    expect(
      session.execute({
        type: 'resolvePlayerChoice',
        choice: { id: 'x', type: ActionEffectType.DISCARD_CARD, sourceInstanceId: 9 },
        choiceType: PendingChoiceType.CHOOSE_CARD,
      }),
    ).toMatchObject({ code: 'ACTION_CANCELLED' });
    expect(session.execute(pay({ resources: { gold: 1 } }))).toMatchObject({
      code: 'ACTION_CANCELLED',
    });
  });

  it('cannot rewind a game without events', () => {
    const session = GameSession.restore('empty', [], catalog(), DEFAULT_OPTIONS);

    expect(session.canRewind()).toBe(false);
  });
});

describe('costs paid in several steps', () => {
  it("asks for the action's effect choice once its cost is paid", () => {
    const session = marketSession();

    session.execute({ type: 'resolveAction', instanceId: 9, actionId: 'trade' });
    expect(pendingTypes(session)).toEqual([PendingChoiceType.CHOOSE_RESOURCE]);
    session.execute(pay({ resources: { gold: 1 } }));

    expect(pendingTypes(session)).toEqual([PendingChoiceType.CHOOSE_CARD]);
  });

  it('upgrades once the resources and the card are both paid', () => {
    const session = marketSession();

    session.execute({ type: 'resolveUpgrade', instanceId: 9, upgradeTo: 2 });
    expect(pendingTypes(session)).toEqual([
      PendingChoiceType.CHOOSE_RESOURCE,
      PendingChoiceType.CHOOSE_CARD,
    ]);
    session.execute(pay({ resources: { wood: 1 } }));
    expect(session.getState().instances[9].stateId).toBe(1);
    session.execute(pay({ discardedCardIds: [5] }));

    const state = session.getState();
    expect(state.instances[9].stateId).toBe(2);
    expect(state.resources).toMatchObject({ gold: 1 });
    expect(state.resources.wood ?? 0).toBe(0);
  });

  it('waits for the cards a draw cheat plays', () => {
    const session = marketSession();

    session.execute({ type: 'cheat', cheat: { op: 'drawCard', instanceIds: [2, 3] } });

    expect(pendingTypes(session)).toEqual([PendingChoiceType.CHOOSE_CARD]);
  });
});

describe('parchments', () => {
  it('resolve their action when dismissed', () => {
    const session = resumedWith({ phase: Phase.PARCHMENT, onGoingParchment: 12 });

    const before = session.getEvents().length;
    session.execute({ type: 'dismissParchment' });

    // The action, then the round start the parchment interrupted.
    expect(session.getEvents()[before]).toMatchObject({
      type: GameEventType.CARD_ACTION,
      sourceInstanceId: 12,
      actionId: '5-1-1',
    });
  });
});

describe('engine errors', () => {
  it('reports cost and unexpected errors without breaking the game', () => {
    const session = marketSession();
    const turnEnded = vi.spyOn(GameAggregate.prototype, 'turnEnded');

    turnEnded.mockImplementationOnce(() => {
      throw new CostResolutionError('errors.cost.notEnoughCardsToDiscard');
    });
    expect(session.execute({ type: 'endTurn' })).toEqual({
      code: 'COST_RESOLUTION',
      message: 'errors.cost.notEnoughCardsToDiscard',
    });
    turnEnded.mockImplementationOnce(() => {
      throw 'broken';
    });
    expect(session.execute({ type: 'endTurn' })).toEqual({
      code: 'ENGINE_ERROR',
      message: 'errors.unknown',
    });
    expect(session.getState().phase).toBe(Phase.PLAYING);
  });

  it('lets verification errors other than a mismatch through', () => {
    const played = marketSession(DEFAULT_OPTIONS);
    played.execute({ type: 'endTurn' });
    vi.spyOn(
      GameSession.prototype as unknown as { settle: () => number },
      'settle',
    ).mockImplementation(() => {
      throw new Error('replay crashed');
    });

    expect(() => GameSession.verify('market', played.getEvents(), catalog())).toThrow(
      'replay crashed',
    );
  });
});
