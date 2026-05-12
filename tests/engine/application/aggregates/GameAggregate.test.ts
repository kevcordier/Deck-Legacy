import { makeInstance, makeState } from '../fixtures';
import { EMPTY_STATE, GameAggregate } from '@engine/application/aggregates/GameAggregate';
import { ChooseActionEffectStrategy } from '@engine/application/playerChoice/ChooseActionEffectStrategy';
import {
  ActionEffectType,
  GameEventType,
  PassiveType,
  PendingChoiceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import { ActionCancelledError } from '@engine/domain/errors/ActionCancelledError';
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
const endOfTurnDef: CardDef = {
  id: 6,
  name: 'EndTurn',
  states: [
    { id: 1, name: 'S', actions: [{ id: 'et', actionEffects: [], trigger: Trigger.END_OF_TURN }] },
  ],
};
const unlimitedPermanentDef: CardDef = {
  id: 8,
  name: 'UnlimitedPermanent',
  states: [
    {
      id: 1,
      name: 'S',
      permanent: true,
      actions: [
        {
          id: 'up-1',
          unlimited: true,
          cost: { discard: [{ scope: [TargetScope.BOARD], pickNumber: 1 }] },
          actionEffects: [],
        },
      ],
    },
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
    expect(EMPTY_STATE.phase).toBe(Phase.PRE_GAME);
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
    // roundStarted shuffles cards and stays at ROUND_START — player must call turnStarted.
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({ drawPile: [1], instances: { 1: inst }, round: 0 });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gs = agg.roundStarted();
    expect(gs.round).toBe(1);
    expect(gs.phase).toBe(Phase.ROUND_START);
  });

  it('processes discoveryPile when drawPile is empty', () => {
    // Empty drawPile: roundStarted adds discovery cards then stays at ROUND_START.
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
    // roundStarted adds discovery cards to drawPile, waits at ROUND_START for player.
    expect(gs.round).toBe(2);
    expect(gs.phase).toBe(Phase.ROUND_START);
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
    expect(gs.round).toBe(1);
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
      phase: Phase.ROUND_START,
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
    // turnStarted with empty drawPile → roundEnded → roundStarted, waits at ROUND_START.
    expect(gs.round).toBe(2);
    expect(gs.phase).toBe(Phase.ROUND_START);
  });

  it('does not auto-fire ON_PLAY triggers — leaves them in the pile', () => {
    const inst = makeInstance({ id: 1, cardId: 4, stateId: 1 });
    const state = makeState({
      drawPile: [1],
      instances: { 1: inst },
      round: 1,
      phase: Phase.ROUND_START,
    });
    const agg = new GameAggregate(state, { 4: onPlayDef }, {}, []);
    const gs = agg.turnStarted();
    expect(gs.phase).toBe(Phase.PLAYING);
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
    expect(gs.phase).toBe(Phase.TURN_END);
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
    expect(gs.round).toBe(2);
    expect(gs.phase).toBe(Phase.ROUND_START);
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
    expect(gs.phase).toBe(Phase.PLAYING);
  });

  it('does not auto-start next turn when an unlimited action is affordable on permanents', () => {
    const perm1 = makeInstance({ id: 1, cardId: 8, stateId: 1 });
    const perm2 = makeInstance({ id: 2, cardId: 8, stateId: 1 });
    const nextTurnCard = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [3],
      permanents: [1, 2],
      instances: { 1: perm1, 2: perm2, 3: nextTurnCard },
      triggerPile: {},
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });

    const agg = new GameAggregate(state, { 1: plainDef, 8: unlimitedPermanentDef }, {}, []);
    const gs = agg.turnEnded();

    expect(gs.phase).toBe(Phase.TURN_END);
    expect(gs.turn).toBe(1);
    expect(gs.drawPile).toEqual([3]);
  });

  it('auto-starts next turn when unlimited actions exist but their cost is not affordable', () => {
    const costlyUnlimitedDef: CardDef = {
      id: 9,
      name: 'CostlyUnlimited',
      states: [
        {
          id: 1,
          name: 'S',
          permanent: true,
          actions: [
            {
              id: 'up-2',
              unlimited: true,
              cost: { discard: [{ scope: [TargetScope.BOARD], pickNumber: 2 }] },
              actionEffects: [],
            },
          ],
        },
      ],
    };

    const perm = makeInstance({ id: 1, cardId: 9, stateId: 1 });
    const nextTurnCard = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [3],
      permanents: [1],
      instances: { 1: perm, 3: nextTurnCard },
      triggerPile: {},
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });

    const agg = new GameAggregate(state, { 1: plainDef, 9: costlyUnlimitedDef }, {}, []);
    const gs = agg.turnEnded();

    expect(gs.phase).toBe(Phase.PLAYING);
    expect(gs.board).toContain(3);
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
    const inst4 = makeInstance({ id: 4, cardId: 1, stateId: 1 });
    const inst5 = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [4, 5],
      board: [1, 2, 3],
      instances: { 1: inst1, 2: inst2, 3: inst3, 4: inst4, 5: inst5 },
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
      phase: Phase.ROUND_START,
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
    expect(gs.phase).toBe(Phase.ROUND_START);
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
    expect(gs.round).toBe(2);
    expect(gs.phase).toBe(Phase.ROUND_START);
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

// ─── roundEnded – early return ────────────────────────────────────────────────

describe('GameAggregate.roundEnded – early return', () => {
  it('returns without starting next round when END_OF_ROUND triggers exist', () => {
    const endOfRoundDef: CardDef = {
      id: 5,
      name: 'EOR',
      states: [
        {
          id: 1,
          name: 'S',
          actions: [{ id: 'eor', actionEffects: [], trigger: Trigger.END_OF_ROUND }],
        },
      ],
    };
    const inst = makeInstance({ id: 1, cardId: 5, stateId: 1 });
    const state = makeState({
      board: [1],
      instances: { 1: inst },
      triggerPile: {},
      phase: Phase.PLAYING,
      round: 1,
    });
    const agg = new GameAggregate(state, { 5: endOfRoundDef }, {}, []);
    const gs = agg.roundEnded();
    // END_OF_ROUND trigger is in the pile → condition fails → no roundStarted
    expect(gs.phase).toBe(Phase.ROUND_END);
    expect(Object.keys(gs.triggerPile)).toHaveLength(1);
  });
});

// ─── hasAvailableUnlimitedAction – limitedTime ────────────────────────────────

describe('GameAggregate.turnEnded – hasAvailableUnlimitedAction', () => {
  it('auto-starts turn when unlimited action limitedTime is exhausted', () => {
    const limitedDef: CardDef = {
      id: 10,
      name: 'LimitedUnlimited',
      states: [
        {
          id: 1,
          name: 'S',
          permanent: true,
          actions: [{ id: 'lu', unlimited: true, limitedTime: 1, actionEffects: [] }],
        },
      ],
    };
    const perm = makeInstance({ id: 1, cardId: 10, stateId: 1, usedActionIds: ['lu'] });
    const nextCard = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [2],
      permanents: [1],
      instances: { 1: perm, 2: nextCard },
      triggerPile: {},
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef, 10: limitedDef }, {}, []);
    const gs = agg.turnEnded();
    // limitedTime exhausted → hasAvailableUnlimitedAction = false → next turn starts
    expect(gs.phase).toBe(Phase.PLAYING);
    expect(gs.board).toContain(2);
  });

  it('returns false immediately when ACTION option is disabled', () => {
    const freeUnlimitedDef: CardDef = {
      id: 11,
      name: 'FreeUnlimited',
      states: [
        {
          id: 1,
          name: 'S',
          permanent: true,
          actions: [{ id: 'fu', unlimited: true, actionEffects: [] }],
        },
      ],
    };
    const perm = makeInstance({ id: 1, cardId: 11, stateId: 1 });
    const nextCard = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [2],
      permanents: [1],
      instances: { 1: perm, 2: nextCard },
      triggerPile: {},
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
      boardEffects: {
        99: [{ id: 'da', type: 'DESACTIVATE_OPTION' as never, options: ['action'], global: true }],
      },
    });
    const agg = new GameAggregate(state, { 1: plainDef, 11: freeUnlimitedDef }, {}, []);
    const gs = agg.turnEnded();
    // ACTION disabled → hasAvailableUnlimitedAction returns false immediately → next turn starts
    expect(gs.phase).toBe(Phase.PLAYING);
    expect(gs.board).toContain(2);
  });

  it('skips blocked instances in hasAvailableUnlimitedAction', () => {
    const freeUnlimitedDef: CardDef = {
      id: 11,
      name: 'FreeUnlimited',
      states: [
        {
          id: 1,
          name: 'S',
          permanent: true,
          actions: [{ id: 'fu', unlimited: true, actionEffects: [] }],
        },
      ],
    };
    const perm = makeInstance({ id: 1, cardId: 11, stateId: 1 });
    const nextCard = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const state = makeState({
      drawPile: [2],
      permanents: [1],
      instances: { 1: perm, 2: nextCard },
      triggerPile: {},
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
      boardEffects: {
        99: [{ id: 'block', type: 'BLOCK' as never, cards: { ids: [1] }, global: true }],
      },
    });
    const agg = new GameAggregate(state, { 1: plainDef, 11: freeUnlimitedDef }, {}, []);
    const gs = agg.turnEnded();
    // Permanent is blocked → skipped → hasAvailableUnlimitedAction = false → next turn starts
    expect(gs.phase).toBe(Phase.PLAYING);
    expect(gs.board).toContain(2);
  });
});

// ─── cardAction – PARCHMENT finalization ─────────────────────────────────────

// ─── cancelCurrentCardAction ─────────────────────────────────────────────────

describe('GameAggregate.cancelCurrentCardAction', () => {
  it('sets currentCardAction to null', () => {
    const state = makeState({
      board: [1],
      instances: { 1: makeInstance({ id: 1 }) },
      phase: Phase.PLAYING,
      round: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    agg.cancelCurrentCardAction();
    expect(agg.getCurrentCardAction()).toBeNull();
  });
});

describe('GameAggregate.cardAction – PARCHMENT finalization', () => {
  it('emits ROUND_STARTED after parchment card action resolves', () => {
    const inst = makeInstance({ id: 1, cardId: 3, stateId: 1 });
    const state = makeState({
      board: [1],
      discardPile: [2],
      instances: {
        1: inst,
        2: makeInstance({ id: 2, cardId: 1, stateId: 1 }),
      },
      phase: Phase.PARCHMENT,
      onGoingParchment: 1,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef, 3: parchmentDef }, {}, []);
    const action = {
      id: 'parch-action',
      actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } }],
    };
    const gs = agg.cardAction(action, 1);
    // After parchment action, ROUND_STARTED is emitted → phase becomes ROUND_START
    expect(gs.phase).toBe(Phase.ROUND_START);
    expect(gs.round).toBe(1);
  });
});

// ─── cardAction – unresolvable effect cancels the whole action ────────────────

describe('GameAggregate.cardAction – unresolvable effect', () => {
  it('throws ActionCancelledError and leaves state unchanged when a card-target effect finds no candidates', () => {
    // Target DISCARD scope on an empty discardPile — cardSelector returns [] → unresolvable
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [],
      discardPile: [],
      instances: { 1: inst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    const gsBefore = agg.getGameState();
    const action = {
      id: 'a1',
      actionEffects: [
        {
          id: 1,
          type: ActionEffectType.DISCARD_CARD,
          cards: { scope: [TargetScope.BOARD], pickMin: 1 }, // empty board → no candidates
        },
      ],
    };
    expect(() => agg.cardAction(action, 1)).toThrow(ActionCancelledError);
    // State unchanged, no currentCardAction left
    expect(agg.getGameState()).toBe(gsBefore);
    expect(agg.getCurrentCardAction()).toBeNull();
  });

  it('throws ActionCancelledError and rolls back effects already applied when a later effect is unresolvable', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      discardPile: [],
      instances: { 1: inst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    // First effect adds gold (would succeed), second effect targets empty discard → unresolvable
    const action = {
      id: 'a2',
      actionEffects: [
        { id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 5 } },
        {
          id: 1,
          type: ActionEffectType.DISCARD_CARD,
          cards: { scope: [TargetScope.DISCARD], pickMin: 1 },
        },
      ],
    };
    expect(() => agg.cardAction(action, 1)).toThrow(ActionCancelledError);
    // Gold must NOT have been added — the whole action was rolled back
    expect(agg.getGameState().resources.gold).toBeUndefined();
    expect(agg.getCurrentCardAction()).toBeNull();
  });

  it('throws ActionCancelledError when unresolvable effect is reached after a player choice', () => {
    const resolved: ResolvedActionEffect = {
      id: '0',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: { gold: 3 },
    };
    // Strategy returns no more pending choices after the player choice
    mockStrategyApply(resolved, []);

    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      discardPile: [],
      instances: { 1: inst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    // CHOOSE_EFFECT first (creates pending choice), then an unresolvable DISCARD_CARD
    const action = {
      id: 'a3',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.CHOOSE_EFFECT,
          effects: [
            { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 1 } },
            { id: 2, type: ActionEffectType.ADD_RESOURCES, resources: { wood: 1 } },
          ],
        },
        {
          id: 3,
          type: ActionEffectType.DISCARD_CARD,
          cards: { scope: [TargetScope.DISCARD], pickMin: 1 }, // empty discard pile → unresolvable
        },
      ],
    };
    agg.cardAction(action, 1);
    // Should have a pending choice from CHOOSE_EFFECT
    expect(agg.getCurrentCardAction()?.getPendingChoices().length).toBeGreaterThan(0);

    // Resolve the choice — the next effect (DISCARD_CARD with no target) throws
    expect(() =>
      agg.resolveCardActionChoice({
        id: 'x',
        type: ActionEffectType.CHOOSE_EFFECT,
        sourceInstanceId: 1,
      }),
    ).toThrow(ActionCancelledError);
    // Action cancelled — gold was not added, no current action remains
    expect(agg.getGameState().resources.gold).toBeUndefined();
    expect(agg.getCurrentCardAction()).toBeNull();
  });

  it('throws ActionCancelledError and rolls back cost after cost resolution when the following effect is unresolvable', () => {
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const state = makeState({
      board: [1],
      discardPile: [],
      resources: { gold: 5, stone: 1 }, // both options affordable → pending cost choice
      instances: { 1: inst },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(state, { 1: plainDef }, {}, []);
    // Multi-option resource cost → pending cost choice; effect targets empty discard → unresolvable
    const action = {
      id: 'a4',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.DISCARD_CARD,
          cards: { scope: [TargetScope.DISCARD], pickMin: 1 },
        },
      ],
      cost: { resources: [{ gold: 1 }, { stone: 1 }] },
    };
    agg.cardAction(action, 1);
    expect(agg.getCurrentCardAction()?.getPendingChoices().length).toBeGreaterThan(0);

    expect(() =>
      agg.resolveCardActionCost({
        resources: { gold: 1 },
        discardedCardIds: [],
        destroyedCardIds: [],
      }),
    ).toThrow(ActionCancelledError);
    // Cost rolled back — original resources unchanged
    expect(agg.getGameState().resources.gold).toBe(5);
    expect(agg.getCurrentCardAction()).toBeNull();
  });
});
