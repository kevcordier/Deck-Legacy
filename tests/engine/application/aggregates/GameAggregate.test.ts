import { makeInstance, makeState } from '../fixtures';
import { EMPTY_STATE, GameAggregate } from '@engine/application/aggregates/GameAggregate';
import { ChooseActionEffectStrategy } from '@engine/application/playerChoice/ChooseActionEffectStrategy';
import {
  ActionEffectType,
  GameEventType,
  PassiveType,
  PendingChoiceType,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef, GameEvent, PendingChoice, ResolvedActionEffect } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── minimal card definitions ─────────────────────────────────────────────────

const plainDef: CardDef = { id: 1, name: 'Plain', states: [{ id: 1, name: 'S' }] };
const parchmentDef: CardDef = {
  id: 3,
  name: 'Parch',
  parchmentCard: true,
  states: [{ id: 1, name: 'S' }],
};
const onPlayDef: CardDef = {
  id: 4,
  name: 'OnPlay',
  states: [
    { id: 1, name: 'S', actions: [{ id: 'op', actionEffects: [], trigger: Trigger.ON_PLAY }] },
  ],
};
const onDiscoverDef: CardDef = {
  id: 5,
  name: 'OnDiscover',
  states: [
    { id: 1, name: 'S', actions: [{ id: 'od', actionEffects: [], trigger: Trigger.ON_DISCOVER }] },
  ],
};
const parchmentOnDiscoverDef: CardDef = {
  id: 7,
  name: 'ParchOnDiscover',
  parchmentCard: true,
  states: [
    { id: 1, name: 'S', actions: [{ id: 'pod', actionEffects: [], trigger: Trigger.ON_DISCOVER }] },
  ],
};
const endOfTurnDef: CardDef = {
  id: 6,
  name: 'EndTurn',
  states: [
    { id: 1, name: 'S', actions: [{ id: 'et', actionEffects: [], trigger: Trigger.END_OF_TURN }] },
  ],
};

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * A CHOOSE_EFFECT action that creates a CHOOSE_ACTION_EFFECT pending choice.
 * Requires only 1 card on the board.
 */
function makeChooseEffectAction() {
  return {
    id: 'choose',
    actionEffects: [
      {
        id: 0,
        type: ActionEffectType.CHOOSE_EFFECT,
        effects: [
          { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } },
          { id: 2, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 1 } },
        ],
      },
    ],
  };
}

/**
 * Spies on ChooseActionEffectStrategy.prototype.apply to return the given resolved
 * action and pending choices. The real constructor is preserved — only the method
 * is intercepted, avoiding constructor-mock pitfalls.
 */
function mockStrategyApply(
  resolvedAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[] = [],
) {
  vi.spyOn(ChooseActionEffectStrategy.prototype, 'apply').mockReturnValue([
    resolvedAction,
    pendingChoices,
  ]);
}

// ─── EMPTY_STATE ──────────────────────────────────────────────────────────────

describe('EMPTY_STATE', () => {
  it('has phase PREGAME and all empty collections', () => {
    expect(EMPTY_STATE.phase).toBe(Phase.PREGAME);
    expect(EMPTY_STATE.board).toHaveLength(0);
    expect(EMPTY_STATE.round).toBe(0);
  });
});

// ─── gameStarted ──────────────────────────────────────────────────────────────

describe('GameAggregate.gameStarted', () => {
  it('creates GAME_STARTED event and sets up instances', () => {
    // Use 5 cards so gameStarted's internal roundStarted+turnStarted(x2) never hits empty drawPile.
    const agg = new GameAggregate(EMPTY_STATE, { 1: plainDef }, {}, []);
    agg.gameStarted(
      [1, 2, 3, 4, 5],
      [
        { id: 1, cardId: 1 },
        { id: 2, cardId: 1 },
        { id: 3, cardId: 1 },
        { id: 4, cardId: 1 },
        { id: 5, cardId: 1 },
      ],
      {},
      [],
    );
    expect(agg.getGameState().instances[1]).toBeDefined();
    expect(agg.getEvents().length).toBeGreaterThan(0);
  });
});

// ─── loadFromHistory ──────────────────────────────────────────────────────────

describe('GameAggregate.loadFromHistory', () => {
  it('replays events and updates game state', () => {
    const agg = new GameAggregate(EMPTY_STATE, { 1: plainDef }, {}, []);
    const event: GameEvent = {
      id: 'e1',
      type: GameEventType.GAME_STARTED,
      timestamp: 0,
      deck: [{ id: 1, cardId: 1 }],
      initialDeck: [1],
      stickerStock: {},
      discoveryPile: [],
    } as never;
    const gs = agg.loadFromHistory([event]);
    expect(gs.drawPile).toEqual([1]);
    expect(agg.getEvents()).toHaveLength(1);
  });
});

// ─── roundStarted ─────────────────────────────────────────────────────────────

describe('GameAggregate.roundStarted', () => {
  it('increments round and draws cards', () => {
    // 1 card available: roundStarted shuffles it, turnStarted draws it.
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({ drawPile: [1], instances: { 1: inst }, round: 0 });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.roundStarted();
    expect(gs.round).toBe(1);
    expect(gs.phase).toBe(Phase.PLAYING);
  });

  it('processes discoveryPile when drawPile is empty', () => {
    // Empty drawPile: roundStarted → turnStarted → roundEnded → processes discoveryPile.
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [],
      discoveryPile: [1, 2],
      instances: { 1: inst1, 2: inst2 },
      round: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.roundStarted();
    // roundEnded was triggered, discovery cards processed, phase is PREROUND
    expect(gs.round).toBe(2);
    expect(gs.phase).toBe(Phase.PREROUND);
  });

  it('handles parchment card as first discovered card', () => {
    // Parchment card first: only 1 new card added, not 2.
    const inst1 = makeInstance({ id: 1, cardId: 3, stateId: 1 }); // parchment
    const state = makeState({
      drawPile: [],
      discoveryPile: [1],
      instances: { 1: inst1 },
      round: 1,
    });
    const agg = new GameAggregate(state, { 3: parchmentDef }, {}, []);
    const gs = agg.roundStarted();
    expect(gs.round).toBe(2);
  });

  it('fires ON_DISCOVER trigger for discovered cards', () => {
    // onDiscoverDef has an ON_DISCOVER trigger that auto-resolves.
    const inst1 = makeInstance({ id: 1, cardId: 5, stateId: 1 }); // onDiscover
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [],
      discoveryPile: [1, 2],
      instances: { 1: inst1, 2: inst2 },
      round: 1,
    });
    const agg = new GameAggregate(state, { 5: onDiscoverDef, 1: plainDef }, {}, []);
    agg.roundStarted();
    expect(agg.getGameState().round).toBe(2);
  });
});

// ─── turnStarted ──────────────────────────────────────────────────────────────

describe('GameAggregate.turnStarted', () => {
  it('draws cards to board and sets phase to PLAYING', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [1],
      instances: { 1: inst },
      round: 1,
      phase: Phase.PRETURN,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.turnStarted();
    expect(gs.phase).toBe(Phase.PLAYING);
    expect(gs.board).toContain(1);
  });

  it('starts a new round when drawPile is empty', () => {
    // Empty drawPile with discoveryPile cards → turnStarted triggers roundEnded.
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [],
      discoveryPile: [1, 2],
      instances: { 1: inst1, 2: inst2 },
      round: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.turnStarted();
    // roundEnded is triggered but does NOT increment round (roundStarted does)
    expect(gs.round).toBe(1);
    expect(gs.phase).toBe(Phase.PREROUND);
  });

  it('does not auto-fire ON_PLAY triggers — leaves them in the pile', () => {
    const inst = makeInstance({ id: 1, cardId: 4, stateId: 1 });
    const state = makeState({
      drawPile: [1],
      instances: { 1: inst },
      round: 1,
      phase: Phase.PRETURN,
    });
    const agg = new GameAggregate(state, { 4: onPlayDef }, {}, []);
    const gs = agg.turnStarted();
    // ON_PLAY triggers are excluded from autoTrigger — they remain in the pile
    expect(gs.phase).toBe(Phase.PLAYING);
    expect(Object.keys(gs.triggerPile)).toHaveLength(1);
  });

  it('does not auto-fire ON_DISCOVER triggers from parchment cards — leaves them in the pile', () => {
    const inst = makeInstance({ id: 1, cardId: 7, stateId: 1 });
    const triggerId = 'test-trigger-uuid';
    const onDiscoverAction = parchmentOnDiscoverDef.states[0].actions?.[0];
    if (!onDiscoverAction) {
      throw new Error('Missing ON_DISCOVER action for parchmentOnDiscoverDef');
    }
    const state = makeState({
      drawPile: [1],
      instances: { 1: inst },
      round: 1,
      phase: Phase.PRETURN,
      triggerPile: {
        [triggerId]: {
          effectDef: onDiscoverAction,
          sourceInstanceId: 1,
        },
      },
    });
    const agg = new GameAggregate(state, { 7: parchmentOnDiscoverDef }, {}, []);
    agg.turnStarted();
    const gs = agg.getGameState();
    // ON_DISCOVER from parchment cards are excluded from autoTrigger
    expect(Object.keys(gs.triggerPile)).toHaveLength(1);
  });
});

// ─── turnEnded ────────────────────────────────────────────────────────────────

describe('GameAggregate.turnEnded', () => {
  it('stays in PRETURN phase when end-of-turn triggers exist', () => {
    const inst = makeInstance({ id: 1, cardId: 6, stateId: 1 });
    const state = makeState({
      board: [1],
      instances: { 1: inst },
      triggerPile: {},
      boardEffects: {},
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 6: endOfTurnDef }, {}, []);
    const gs = agg.turnEnded();
    expect(gs.phase).toBe(Phase.POSTTURN);
  });

  it('calls roundEnded when no triggers and drawPile is empty', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [],
      board: [1],
      instances: { 1: inst },
      triggerPile: {},
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.turnEnded();
    expect(gs.phase).toBe(Phase.PREROUND);
  });

  it('does not call roundEnded when trigger pile is empty but drawPile is not empty', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [1],
      instances: { 1: inst },
      triggerPile: {},
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.turnEnded();
    expect(gs.phase).toBe(Phase.POSTTURN);
  });
});

// ─── autoTrigger ──────────────────────────────────────────────────────────────

describe('GameAggregate.autoTrigger (via roundEnded)', () => {
  it('auto-resolves mandatory ON_DISCOVER trigger and removes it from pile', () => {
    const inst = makeInstance({ id: 1, cardId: 5, stateId: 1 });
    const onDiscoverAction = { id: 'od', actionEffects: [], trigger: Trigger.ON_DISCOVER };
    const triggerId = 'auto-trigger-id';
    const state = makeState({
      instances: { 1: inst },
      round: 1,
      triggerPile: { [triggerId]: { effectDef: onDiscoverAction, sourceInstanceId: 1 } },
    });
    const agg = new GameAggregate(state, { 5: onDiscoverDef }, {}, []);
    const gs = agg.roundEnded();
    expect(Object.keys(gs.triggerPile)).toHaveLength(0);
  });
});

// ─── cardProduced ─────────────────────────────────────────────────────────────

describe('GameAggregate.cardProduced', () => {
  it('adds resources and discards producing card', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      instances: { 1: inst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.cardProduced(1, { gold: 3 });
    expect(gs.resources.gold).toBe(3);
    expect(gs.board).not.toContain(1);
  });
});

// ─── advance ──────────────────────────────────────────────────────────────────

describe('GameAggregate.advance', () => {
  it('draws 2 cards from drawPile', () => {
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [1, 2, 3],
      instances: { 1: inst1, 2: inst2, 3: inst3 },
      phase: Phase.PLAYING,
      round: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.advance();
    expect(gs.board).toHaveLength(2);
  });

  it('treats ADJUST_ADVANCE_CARDS passive with no amount as zero bonus', () => {
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [1, 2],
      instances: { 1: inst1, 2: inst2 },
      boardEffects: {
        99: [
          {
            id: 'no-amount',
            type: PassiveType.SET_GAME_PARAMETER,
            parameters: { advanceCardDrawn: undefined },
          },
        ],
      },
      phase: Phase.PLAYING,
      round: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.advance();
    expect(gs.board).toHaveLength(2);
  });

  it('draws 2 additional cards when a board effect adjusts advance draw count', () => {
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const inst4 = makeInstance({ id: 4, cardId: 1, stateId: 1 });
    const inst5 = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [1, 2, 3, 4, 5],
      instances: { 1: inst1, 2: inst2, 3: inst3, 4: inst4, 5: inst5 },
      boardEffects: {
        99: [
          {
            id: 'bonus-advance',
            type: PassiveType.SET_GAME_PARAMETER,
            parameters: { advanceCardDrawn: 4 },
          },
        ],
      },
      phase: Phase.PLAYING,
      round: 1,
    });

    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.advance();

    expect(gs.board).toHaveLength(4);
  });

  it('returns current state when drawPile is empty', () => {
    const agg = new GameAggregate(EMPTY_STATE, {}, {}, []);
    const gsBefore = agg.getGameState();
    const gs = agg.advance();
    expect(gs).toBe(gsBefore);
  });
});

// ─── upgradeCard ──────────────────────────────────────────────────────────────

describe('GameAggregate.upgradeCard', () => {
  it('changes stateId, spends cost, discards card, then ends turn', () => {
    const defUpgrade: CardDef = {
      id: 1,
      name: 'U',
      states: [
        { id: 1, name: 'S1' },
        { id: 2, name: 'S2' },
      ],
    };
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 2 });
    const inst4 = makeInstance({ id: 4, cardId: 1, stateId: 2 });
    const inst5 = makeInstance({ id: 5, cardId: 1, stateId: 2 });
    const state = makeState({
      board: [1, 2, 3, 4],
      drawPile: [5],
      instances: { 1: inst1, 2: inst2, 3: inst3, 4: inst4, 5: inst5 },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: defUpgrade }, {}, []);
    const gs = agg.upgradeCard(1, 2, {});
    expect(gs.instances[1].stateId).toBe(2);
    expect(gs.discardPile).toContain(1);
  });

  it('applies discarded and destroyed cards as upgrade costs', () => {
    const defUpgrade: CardDef = {
      id: 1,
      name: 'U',
      states: [
        { id: 1, name: 'S1' },
        { id: 2, name: 'S2' },
      ],
    };
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1, 2, 3],
      instances: { 1: inst1, 2: inst2, 3: inst3 },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: defUpgrade }, {}, []);
    const gs = agg.upgradeCard(1, 2, {}, [2], [3]);
    expect(gs.instances[1].stateId).toBe(2);
    expect(gs.discardPile).toContain(2);
    expect(gs.destroyedPile).toContain(3);
  });
});

// ─── cardAction ───────────────────────────────────────────────────────────────

describe('GameAggregate.cardAction', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('applies a simple action and returns updated state', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      instances: { 1: inst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const action = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 5 } }],
    };
    const gs = agg.cardAction(action, 1);
    expect(gs.resources.gold).toBe(5);
  });

  it('returns state with pending choices without finalizing', () => {
    // CHOOSE_EFFECT action creates a pending choice; cardAction returns early without finalizing.
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      instances: { 1: inst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    agg.cardAction(makeChooseEffectAction(), 1);
    expect(agg.getCurrentCardAction()?.getPendingChoices().length).toBeGreaterThan(0);
  });

  it('ends turn when action.endsTurn is true', () => {
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const inst4 = makeInstance({ id: 4, cardId: 1, stateId: 1 });
    const inst5 = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1, 2, 3, 4],
      drawPile: [5],
      instances: { 1: inst1, 2: inst2, 3: inst3, 4: inst4, 5: inst5 },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const action = { id: 'et', actionEffects: [], endsTurn: true };
    const gs = agg.cardAction(action, 1);
    expect(gs.phase).toBe(Phase.POSTTURN);
  });
});

// ─── resolveCardActionChoice ──────────────────────────────────────────────────

describe('GameAggregate.resolveCardActionChoice', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns current state when no current card action', () => {
    const agg = new GameAggregate(EMPTY_STATE, {}, {}, []);
    const gs = agg.resolveCardActionChoice({
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
    });
    expect(gs).toBe(agg.getGameState());
  });

  it('resolves pending choice and finalizes action', () => {
    // Mock strategy to return a resolved ADD_RESOURCES effect with no more choices.
    const resolved: ResolvedActionEffect = {
      id: '0',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: { gold: 5 },
    };
    mockStrategyApply(resolved, []);

    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      instances: { 1: inst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    agg.cardAction(makeChooseEffectAction(), 1);
    expect(agg.getCurrentCardAction()?.getPendingChoices().length).toBeGreaterThan(0);

    const gs = agg.resolveCardActionChoice({
      id: 'x',
      type: ActionEffectType.CHOOSE_EFFECT,
      sourceInstanceId: 1,
    });
    expect(gs.resources.gold).toBe(5);
    // Action is finalized — no current card action remains
    expect(agg.getCurrentCardAction()).toBeNull();
  });

  it('returns state without finalizing when choices still pending after choice', () => {
    // Mock strategy to return another pending choice — action must not be finalized.
    const anotherPending: PendingChoice = {
      id: 'next',
      kind: ActionEffectType.ADD_RESOURCES,
      type: PendingChoiceType as never,
      sourceInstanceId: 1,
      choices: [{ gold: 1 }, { wood: 1 }],
      pickMin: 1,
      pickMax: 1,
      isMandatory: true,
    };
    const resolved: ResolvedActionEffect = {
      id: '0',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
    };
    mockStrategyApply(resolved, [anotherPending]);

    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      instances: { 1: inst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    agg.cardAction(makeChooseEffectAction(), 1);

    const gs = agg.resolveCardActionChoice({
      id: 'x',
      type: ActionEffectType.CHOOSE_EFFECT,
      sourceInstanceId: 1,
    });
    // Still has a pending choice — action not finalized
    expect(agg.getCurrentCardAction()?.getPendingChoices().length).toBeGreaterThan(0);
    expect(gs.resources.gold).toBeUndefined();
  });
});

// ─── resolveCardActionCost ────────────────────────────────────────────────────

describe('GameAggregate.resolveCardActionCost', () => {
  it('returns current state when no current card action', () => {
    const agg = new GameAggregate(EMPTY_STATE, {}, {}, []);
    const gs = agg.resolveCardActionCost({
      resources: {},
      discardedCardIds: [],
      destroyedCardIds: [],
    });
    expect(gs).toBe(agg.getGameState());
  });

  it('resolves pending cost choice and finalizes action', () => {
    // Resource cost with multiple options creates a CHOOSE_RESOURCE pending choice.
    // Only 1 card needed — the cost is resource-based.
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      resources: { gold: 5, stone: 1 },
      instances: { 1: inst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const action = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 2 } }],
      cost: { resources: [{ gold: 1 }, { stone: 1 }] },
    };
    agg.cardAction(action, 1);
    expect(agg.getCurrentCardAction()?.getPendingChoices().length).toBeGreaterThan(0);

    const gs = agg.resolveCardActionCost({
      resources: { gold: 1 },
      discardedCardIds: [],
      destroyedCardIds: [],
    });
    expect(gs.resources.wood).toBe(2);
  });

  it('returns state without finalizing when effects have pending choices after cost resolved', () => {
    // Combine a resource cost (creates cost pending choice) with a CHOOSE_EFFECT action effect
    // (creates effect pending choice after cost is paid). The CHOOSE_EFFECT pending choice
    // prevents finalization after resolveCardActionCost.
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      resources: { gold: 5 },
      instances: { 1: inst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const action = {
      id: 'a1',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.CHOOSE_EFFECT,
          effects: [
            { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } },
            { id: 2, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 1 } },
          ],
        },
      ],
      cost: { resources: [{ gold: 1 }, { stone: 1 }] },
    };
    agg.cardAction(action, 1);
    // Pay the cost — resolveEffectsFrom(0) then creates a CHOOSE_EFFECT pending choice
    const gs = agg.resolveCardActionCost({
      resources: { gold: 1 },
      discardedCardIds: [],
      destroyedCardIds: [],
    });
    // The CHOOSE_EFFECT effect creates a pending choice — action not finalized
    expect(agg.getCurrentCardAction()?.getPendingChoices().length).toBeGreaterThan(0);
    expect(gs.discardPile).toHaveLength(0);
  });
});

// ─── skipTrigger ──────────────────────────────────────────────────────────────

describe('GameAggregate.skipTrigger', () => {
  it('throws when triggerId not in triggerPile', () => {
    const agg = new GameAggregate(EMPTY_STATE, {}, {}, []);
    expect(() => agg.skipTrigger('nonexistent')).toThrow('Trigger with id nonexistent not found');
  });

  it('removes trigger from pile without advancing turn', () => {
    // Two triggers in pile; after skipping one, the other remains → no turn advance
    const optionalEndOfTurnDef: CardDef = {
      id: 6,
      name: 'OptEndTurn',
      states: [
        {
          id: 1,
          name: 'S',
          actions: [{ id: 'et', actionEffects: [], trigger: Trigger.END_OF_TURN, optional: true }],
        },
      ],
    };
    const inst1 = makeInstance({ id: 1, cardId: 6, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 6, stateId: 1 });
    const state = makeState({
      board: [1, 2],
      instances: { 1: inst1, 2: inst2 },
      phase: Phase.PRETURN,
      round: 1,
      turn: 1,
      triggerPile: {
        tid1: { effectDef: { id: 'et', actionEffects: [] }, sourceInstanceId: 1 },
        tid2: { effectDef: { id: 'et', actionEffects: [] }, sourceInstanceId: 2 },
      },
    });
    const agg = new GameAggregate(state, { 6: optionalEndOfTurnDef }, {}, []);
    const gs = agg.skipTrigger('tid1');
    expect(gs.triggerPile['tid1']).toBeUndefined();
    expect(gs.triggerPile['tid2']).toBeDefined();
    expect(gs.phase).toBe(Phase.PRETURN);
  });

  it('starts next turn after skipping last trigger in PRETURN phase', () => {
    const optionalEndOfTurnDef: CardDef = {
      id: 6,
      name: 'OptEndTurn',
      states: [
        {
          id: 1,
          name: 'S',
          actions: [{ id: 'et', actionEffects: [], trigger: Trigger.END_OF_TURN, optional: true }],
        },
      ],
    };
    const inst1 = makeInstance({ id: 1, cardId: 6, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const inst4 = makeInstance({ id: 4, cardId: 1, stateId: 1 });
    const inst5 = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1, 2, 3, 4],
      drawPile: [5],
      instances: { 1: inst1, 2: inst2, 3: inst3, 4: inst4, 5: inst5 },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 6: optionalEndOfTurnDef, 1: plainDef }, {}, []);
    agg.turnEnded();
    const triggerId = Object.keys(agg.getGameState().triggerPile)[0];
    const gs = agg.skipTrigger(triggerId);
    expect(gs.phase).toBe(Phase.POSTTURN);
  });

  it('starts next turn when last trigger is skipped in PRETURN phase', () => {
    // Set phase to PRETURN with one optional trigger and cards in drawPile
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [2],
      instances: { 1: inst, 2: inst2 },
      phase: Phase.PRETURN,
      round: 1,
      turn: 0,
      triggerPile: {
        tid1: {
          effectDef: { id: 'et', actionEffects: [], optional: true },
          sourceInstanceId: 1,
        },
      },
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.skipTrigger('tid1');
    expect(gs.phase).toBe(Phase.PLAYING);
  });
});

// ─── turnEnded with empty drawPile ────────────────────────────────────────────

describe('GameAggregate.turnEnded – empty drawPile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls roundEnded when drawPile is empty after turn ended with no triggers', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      drawPile: [],
      discoveryPile: [2],
      instances: { 1: inst, 2: inst2 },
      triggerPile: {},
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.turnEnded();
    expect(gs.round).toBe(1);
    expect(gs.phase).toBe(Phase.PREROUND);
  });
});

// ─── upgradeCard canUseOptions ────────────────────────────────────────────────

describe('GameAggregate.upgradeCard – blocked by option', () => {
  it('returns current state when UPGRADE option is blocked', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const sourceInst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      instances: { 1: inst, 2: sourceInst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
      boardEffects: {
        2: [{ id: 'da', type: 'DESACTIVATE_OPTION' as never, options: ['upgrade'] }],
      },
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gsBefore = agg.getGameState();
    const gs = agg.upgradeCard(1, 2, {});
    expect(gs).toBe(gsBefore);
  });
});

// ─── chooseState ──────────────────────────────────────────────────────────────

describe('GameAggregate.chooseState', () => {
  it('applies CHOOSE_STATE event and returns updated state', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({ instances: { 1: inst } });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.chooseState(1, 2);
    expect(gs.instances[1].stateId).toBe(2);
  });

  it('updates existing CHOOSE_STATE event when called again for same card', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({ instances: { 1: inst } });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    agg.chooseState(1, 2);
    const eventsBefore = agg.getEvents().length;
    agg.chooseState(1, 3);
    // Should replace existing event, not push a new one
    expect(agg.getEvents().length).toBe(eventsBefore);
    expect(agg.getGameState().instances[1].stateId).toBe(3);
  });

  it('pushes a new event when no existing CHOOSE_STATE event for that card', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({ instances: { 1: inst } });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const eventsBefore = agg.getEvents().length;
    agg.chooseState(1, 2);
    expect(agg.getEvents().length).toBe(eventsBefore + 1);
  });
});

// ─── cardAction canUseOptions ─────────────────────────────────────────────────

describe('GameAggregate.cardAction – blocked by option', () => {
  it('returns current state when ACTION option is blocked', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const sourceInst = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      instances: { 1: inst, 2: sourceInst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
      boardEffects: {
        2: [{ id: 'da', type: 'DESACTIVATE_OPTION' as never, options: ['action'] }],
      },
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gsBefore = agg.getGameState();
    const action = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 5 } }],
    };
    const gs = agg.cardAction(action, 1);
    expect(gs).toBe(gsBefore);
  });
});
