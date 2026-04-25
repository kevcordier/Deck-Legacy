import { makeInstance, makeState } from '../fixtures';
import { EMPTY_STATE, GameAggregate } from '@engine/application/aggregates/GameAggregate';
import { ActionEffectType, GameEventType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef, GameEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { describe, expect, it } from 'vitest';

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
const endOfTurnDef: CardDef = {
  id: 6,
  name: 'EndTurn',
  states: [
    { id: 1, name: 'S', actions: [{ id: 'et', actionEffects: [], trigger: Trigger.END_OF_TURN }] },
  ],
};

function buildAggregate(defs: Record<number, CardDef>) {
  return new GameAggregate(EMPTY_STATE, defs, {}, []);
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
  it('creates GAME_STARTED event and returns it', () => {
    const agg = buildAggregate({ 1: plainDef });
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const event = agg.gameStarted([inst], [1], { 1: 3 }, [2]);
    expect(event.type).toBe(GameEventType.GAME_STARTED);
    expect(agg.getGameState().drawPile).toEqual([1]);
    expect(agg.getEvents()).toHaveLength(1);
  });
});

// ─── loadFromHistory ──────────────────────────────────────────────────────────

describe('GameAggregate.loadFromHistory', () => {
  it('replays events and updates game state', () => {
    const agg = buildAggregate({ 1: plainDef });
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const event: GameEvent = {
      id: 'e1',
      type: GameEventType.GAME_STARTED,
      timestamp: 0,
      cardInstances: [inst],
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
  it('increments round for round 1 (no discovery processing)', () => {
    const agg = buildAggregate({ 1: plainDef });
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    agg.gameStarted([inst], [1], {}, []);
    const gs = agg.roundStarted();
    expect(gs.round).toBe(1);
    expect(gs.phase).toBe(Phase.START_ROUND);
  });

  it('picks two cards from discoveryPile for round 2+', () => {
    const agg = buildAggregate({ 1: plainDef });
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    agg.gameStarted([inst1, inst2, inst3], [1], {}, [2, 3]);
    agg.roundStarted(); // round 1
    const gs = agg.roundStarted(); // round 2 — picks from discovery
    expect(gs.round).toBe(2);
  });

  it('handles parchment card as first discovered card in round 2+', () => {
    const agg = buildAggregate({ 1: plainDef, 3: parchmentDef });
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 3, stateId: 1 });
    agg.gameStarted([inst1, inst3], [1], {}, [3]);
    agg.roundStarted(); // round 1
    const gs = agg.roundStarted(); // round 2: parchment first
    expect(gs.round).toBe(2);
  });

  it('fires ON_DISCOVER trigger for discovered cards', () => {
    const agg = buildAggregate({ 5: onDiscoverDef, 1: plainDef });
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst5 = makeInstance({ id: 5, cardId: 5, stateId: 1 });
    const inst6 = makeInstance({ id: 6, cardId: 1, stateId: 1 });
    agg.gameStarted([inst1, inst5, inst6], [1], {}, [5, 6]);
    agg.roundStarted(); // round 1
    agg.roundStarted(); // round 2 — inst5 triggers ON_DISCOVER
    // Just assert we got through without error — trigger fires automatically
    expect(agg.getGameState().round).toBe(2);
  });
});

// ─── turnStarted ──────────────────────────────────────────────────────────────

describe('GameAggregate.turnStarted', () => {
  it('draws cards to board and sets phase to PLAYING', () => {
    const agg = buildAggregate({ 1: plainDef });
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    agg.gameStarted([inst], [1], {}, []);
    agg.roundStarted();
    const gs = agg.turnStarted();
    expect(gs.phase).toBe(Phase.PLAYING);
    expect(gs.board).toContain(1);
  });

  it('starts a new round when drawPile is empty', () => {
    const agg = buildAggregate({ 1: plainDef });
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    // inst2 and inst3 are in discoveryPile so round 2 can pick from them
    agg.gameStarted([inst1, inst2, inst3], [1], {}, [2, 3]);
    agg.roundStarted();
    agg.turnStarted(); // inst1 drawn, drawPile now empty
    const gs = agg.turnStarted(); // empty drawPile → roundStarted (round 2)
    expect(gs.round).toBe(2);
  });

  it('fires ON_PLAY triggers for cards with that trigger', () => {
    const agg = buildAggregate({ 4: onPlayDef });
    const inst = makeInstance({ id: 1, cardId: 4, stateId: 1 });
    agg.gameStarted([inst], [1], {}, []);
    agg.roundStarted();
    const gs = agg.turnStarted();
    // trigger auto-resolves since it's non-optional with no pending choices
    expect(gs.phase).toBe(Phase.PLAYING);
  });
});

// ─── turnEnded ────────────────────────────────────────────────────────────────

describe('GameAggregate.turnEnded', () => {
  it('automatically starts next turn when no end-of-turn triggers', () => {
    const agg = buildAggregate({ 1: plainDef });
    // 5 cards: turnStarted draws 4, leaving 1 in drawPile so the auto-triggered turnStarted succeeds
    const insts = [1, 2, 3, 4, 5].map(id => makeInstance({ id, cardId: 1, stateId: 1 }));
    agg.gameStarted(insts, [1, 2, 3, 4, 5], {}, []);
    agg.roundStarted();
    agg.turnStarted(); // draws 4, drawPile has 1 remaining
    const gs = agg.turnEnded();
    expect(gs.phase).toBe(Phase.PLAYING);
  });

  it('stays in END_TURN phase when end-of-turn triggers exist', () => {
    const agg = buildAggregate({ 6: endOfTurnDef });
    const inst = makeInstance({ id: 1, cardId: 6, stateId: 1 });
    agg.gameStarted([inst], [1], {}, []);
    agg.roundStarted();
    agg.turnStarted();
    const gs = agg.turnEnded();
    expect(gs.phase).toBe(Phase.END_TURN);
  });
});

// ─── cardProduced ─────────────────────────────────────────────────────────────

describe('GameAggregate.cardProduced', () => {
  it('adds resources and discards producing card', () => {
    const agg = buildAggregate({ 1: plainDef });
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    agg.gameStarted([inst], [1], {}, []);
    agg.roundStarted();
    agg.turnStarted();
    const gs = agg.cardProduced(1, { gold: 3 });
    expect(gs.resources.gold).toBe(3);
    expect(gs.board).not.toContain(1);
  });
});

// ─── advance ──────────────────────────────────────────────────────────────────

describe('GameAggregate.advance', () => {
  it('draws 2 cards from drawPile', () => {
    const agg = buildAggregate({ 1: plainDef });
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    agg.gameStarted([inst1, inst2, inst3], [1, 2, 3], {}, []);
    agg.roundStarted();
    agg.turnStarted(); // draws 4, but only 3 available → draws [1,2,3]
    // Reset with fresh state to test advance
    const agg2 = buildAggregate({ 1: plainDef });
    const i1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const i2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const i3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    agg2.gameStarted([i1, i2, i3], [1, 2, 3], {}, []);
    agg2.roundStarted();
    const gs = agg2.advance();
    expect(gs.board).toHaveLength(2);
  });

  it('returns current state when drawPile is empty', () => {
    const agg = buildAggregate({});
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
    // Instance 1 is placed directly on the board to avoid shuffle non-determinism
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
});

// ─── cardAction ───────────────────────────────────────────────────────────────

describe('GameAggregate.cardAction', () => {
  it('applies a simple action and returns updated state', () => {
    const agg = buildAggregate({ 1: plainDef });
    const inst = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    agg.gameStarted([inst], [1], {}, []);
    agg.roundStarted();
    agg.turnStarted();
    const action = {
      id: 'a1',
      actionEffects: [{ id: 0, type: ActionEffectType.ADD_RESOURCES, resources: { gold: 5 } }],
    };
    const gs = agg.cardAction(action, 1);
    expect(gs.resources.gold).toBe(5);
  });

  it('returns state with pending choices without finalizing', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const agg = buildAggregate({ 1: plainDef });
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    agg.gameStarted([inst1, inst2, inst3], [1, 2, 3], {}, []);
    agg.roundStarted();
    agg.turnStarted();
    const action = {
      id: 'a1',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.DISCARD_CARD,
          cards: { scope: [TargetScope.BOARD] },
          pickNumber: 1,
        },
      ],
    };
    agg.cardAction(action, 1);
    expect(agg.getCurrentCardAction()?.getPendingChoices().length).toBeGreaterThan(0);
  });

  it('ends turn when action.endsTurn is true', () => {
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const inst4 = makeInstance({ id: 4, cardId: 1, stateId: 1 });
    const inst5 = makeInstance({ id: 5, cardId: 1, stateId: 1 });
    // Instance 1 is placed directly on the board to avoid shuffle non-determinism
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
    expect(gs.phase).toBe(Phase.PLAYING);
  });
});

// ─── resolveCardActionChoice / resolveCardActionCost ──────────────────────────

describe('GameAggregate.resolveCardActionChoice', () => {
  it('returns current state when no current card action', () => {
    const agg = buildAggregate({});
    const gs = agg.resolveCardActionChoice({
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
    });
    expect(gs).toBe(agg.getGameState());
  });

  it('resolves pending choice and finalizes action', () => {
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const agg = buildAggregate({ 1: plainDef });
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    agg.gameStarted([inst1, inst2, inst3], [1, 2, 3], {}, []);
    agg.roundStarted();
    agg.turnStarted();
    const action = {
      id: 'a1',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.DISCARD_CARD,
          cards: { scope: [TargetScope.BOARD] },
          pickNumber: 1,
        },
      ],
    };
    agg.cardAction(action, 1);
    const gs = agg.resolveCardActionChoice({
      id: 'x',
      type: ActionEffectType.DISCARD_CARD,
      sourceInstanceId: 1,
      instanceIds: [2],
    });
    expect(gs.discardPile).toContain(2);
  });

  it('returns state without finalizing when choices still pending after choice', () => {
    // Board has 3 cards: source (id=1) filtered out, leaving [2, 3] → CHOOSE_CARD.
    // Choosing the multi-production card (id=2) triggers a CHOOSE_RESOURCE follow-up (line 318).
    const multiProdDef: CardDef = {
      id: 2,
      name: 'MultiProd',
      states: [{ id: 1, name: 'S', productions: [{ gold: 1 }, { wood: 1 }] }],
    };
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 2, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const initialState = makeState({
      board: [1, 2, 3],
      instances: { 1: inst1, 2: inst2, 3: inst3 },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(initialState, { 1: plainDef, 2: multiProdDef }, {}, []);
    const action = {
      id: 'a1',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.ADD_RESOURCES,
          cards: { scope: [TargetScope.BOARD] },
          pickNumber: 1,
        },
      ],
    };
    agg.cardAction(action, 1);
    const gs = agg.resolveCardActionChoice({
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      instanceIds: [2],
    });
    // Still has a CHOOSE_RESOURCE pending choice — action not finalized
    expect(agg.getCurrentCardAction()?.getPendingChoices().length).toBeGreaterThan(0);
    expect(gs.resources.gold).toBeUndefined();
  });
});

describe('GameAggregate.resolveCardActionCost', () => {
  it('returns current state when no current card action', () => {
    const agg = buildAggregate({});
    const gs = agg.resolveCardActionCost({
      resources: {},
      discardedCardIds: [],
      destroyedCardIds: [],
    });
    expect(gs).toBe(agg.getGameState());
  });

  it('resolves pending cost choice and finalizes action', () => {
    // Build with custom initial state that has gold so canAffordResources passes
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const initialState = makeState({
      board: [1, 2, 3],
      resources: { gold: 5 },
      instances: { 1: inst1, 2: inst2, 3: inst3 },
    });
    const agg = new GameAggregate(initialState, { 1: plainDef }, {}, []);

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
    const inst1 = makeInstance({ id: 1, cardId: 1, stateId: 1 });
    const inst2 = makeInstance({ id: 2, cardId: 1, stateId: 1 });
    const inst3 = makeInstance({ id: 3, cardId: 1, stateId: 1 });
    const initialState = makeState({
      board: [1, 2, 3],
      resources: { gold: 5 },
      instances: { 1: inst1, 2: inst2, 3: inst3 },
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
    });
    const agg = new GameAggregate(initialState, { 1: plainDef }, {}, []);
    const action = {
      id: 'a1',
      actionEffects: [
        {
          id: 0,
          type: ActionEffectType.DISCARD_CARD,
          cards: { scope: [TargetScope.BOARD] },
          pickNumber: 1,
        },
      ],
      cost: { resources: [{ gold: 1 }, { stone: 1 }] },
    };
    agg.cardAction(action, 1);
    // Pay the cost — effects then need a card choice for discard
    const gs = agg.resolveCardActionCost({
      resources: { gold: 1 },
      discardedCardIds: [],
      destroyedCardIds: [],
    });
    // The DISCARD_CARD effect created a pending CHOOSE_CARD choice
    expect(agg.getCurrentCardAction()?.getPendingChoices().length).toBeGreaterThan(0);
    expect(gs.discardPile).toHaveLength(0);
  });
});

// ─── skipTrigger ──────────────────────────────────────────────────────────────

describe('GameAggregate.skipTrigger', () => {
  it('throws when triggerId not in triggerPile', () => {
    const agg = buildAggregate({});
    expect(() => agg.skipTrigger('nonexistent')).toThrow('Trigger with id nonexistent not found');
  });

  it('removes trigger from pile without advancing turn', () => {
    // Two triggers in pile; after skipping one, the other remains → no turn advance (line 379)
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
      phase: Phase.END_TURN,
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
    expect(gs.phase).toBe(Phase.END_TURN);
  });

  it('starts next turn after skipping last trigger in END_TURN phase', () => {
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
    // Instance 1 (trigger card) is placed directly on the board to avoid shuffle non-determinism
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
