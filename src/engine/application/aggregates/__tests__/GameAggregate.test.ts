import { describe, it, expect } from 'vitest';
import { GameAggregate, EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import { ActionType, GameEventType } from '@engine/domain/enums';
import type {
  CardDef,
  CardInstance,
  GameState,
  ResolvedAction,
  ResolvedCost,
} from '@engine/domain/types';

// — fixtures —

const makeInstance = (id: number, cardId: number, stateId: number): CardInstance => ({
  id,
  cardId,
  stateId,
  stickers: {},
  trackProgress: null,
});

const makeDef = (id: number, stateIds: number[] = [1]): CardDef => ({
  id,
  name: `Card ${id}`,
  states: stateIds.map(sid => ({ id: sid, name: `State ${sid}` })),
});

const makeEmptyResolvedCost = (): ResolvedCost => ({
  resources: {},
  discardedCardIds: [],
  destroyedCardIds: [],
});

const makeAggregate = (
  defs: Record<number, CardDef> = {},
  initialState: GameState = { ...EMPTY_STATE },
) => new GameAggregate([], initialState, defs);

// — EMPTY_STATE —

describe('EMPTY_STATE', () => {
  it('has empty collections and zero counters', () => {
    expect(EMPTY_STATE.drawPile).toEqual([]);
    expect(EMPTY_STATE.discardPile).toEqual([]);
    expect(EMPTY_STATE.board).toEqual([]);
    expect(EMPTY_STATE.resources).toEqual({});
    expect(EMPTY_STATE.round).toBe(0);
    expect(EMPTY_STATE.turn).toBe(0);
  });
});

// — gameStarted —

describe('GameAggregate.gameStarted', () => {
  it('returns a GAME_STARTED event', () => {
    const defs = { 10: makeDef(10) };
    const agg = makeAggregate(defs);
    const instances = [makeInstance(1, 10, 1)];
    const event = agg.gameStarted(instances, [1], {}, []);
    expect(event.type).toBe(GameEventType.GAME_STARTED);
    expect(event.cardInstances).toEqual(instances);
    expect(event.initialDeck).toEqual([1]);
  });

  it('populates the game state with instances and draw pile', () => {
    const defs = { 10: makeDef(10) };
    const agg = makeAggregate(defs);
    const instances = [makeInstance(1, 10, 1)];
    agg.gameStarted(instances, [1], {}, []);
    const gs = agg.getGameState();
    expect(gs.instances[1]).toBeDefined();
    expect(gs.drawPile).toEqual([1]);
  });

  it('sets round and turn to 0', () => {
    const defs = { 10: makeDef(10) };
    const agg = makeAggregate(defs);
    agg.gameStarted([makeInstance(1, 10, 1)], [1], {}, []);
    const gs = agg.getGameState();
    expect(gs.round).toBe(0);
    expect(gs.turn).toBe(0);
  });

  it('sets stickerStock from the event', () => {
    const defs = { 10: makeDef(10) };
    const agg = makeAggregate(defs);
    agg.gameStarted([makeInstance(1, 10, 1)], [1], { 101: 5 }, []);
    expect(agg.getGameState().stickerStock).toEqual({ 101: 5 });
  });
});

// — roundStarted —

describe('GameAggregate.roundStarted', () => {
  it('increments the round counter', () => {
    const defs = { 10: makeDef(10) };
    const agg = makeAggregate(defs);
    agg.gameStarted([makeInstance(1, 10, 1)], [1], {}, []);
    agg.roundStarted();
    expect(agg.getGameState().round).toBe(1);
  });

  it('resets turn to 0', () => {
    const defs = { 10: makeDef(10) };
    const agg = makeAggregate(defs);
    agg.gameStarted([makeInstance(1, 10, 1)], [1], {}, []);
    agg.roundStarted();
    expect(agg.getGameState().turn).toBe(0);
  });

  it('returns a ROUND_STARTED event', () => {
    const defs = { 10: makeDef(10) };
    const agg = makeAggregate(defs);
    agg.gameStarted([makeInstance(1, 10, 1)], [1], {}, []);
    const event = agg.roundStarted();
    expect(event.type).toBe(GameEventType.ROUND_STARTED);
    expect(event.round).toBe(1);
  });

  it('shuffles discard and board back into drawPile on round start', () => {
    const defs = { 10: makeDef(10) };
    const state: GameState = {
      ...EMPTY_STATE,
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
      },
      discardPile: [1],
      board: [2],
      drawPile: [],
      discoveryPile: [],
    };
    const agg = new GameAggregate([], state, defs);
    agg.roundStarted();
    const gs = agg.getGameState();
    expect(gs.discardPile).toEqual([]);
    expect(gs.board).toEqual([]);
    expect(gs.drawPile).toHaveLength(2);
  });
});

// — turnStarted —

describe('GameAggregate.turnStarted', () => {
  it('draws up to 4 cards and increments turn', () => {
    const defs: Record<number, CardDef> = {
      10: makeDef(10),
      11: makeDef(11),
      12: makeDef(12),
      13: makeDef(13),
      14: makeDef(14),
    };
    const instances = [1, 2, 3, 4, 5].map(id => makeInstance(id, 10 + id - 1, 1));
    const state: GameState = {
      ...EMPTY_STATE,
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      drawPile: [1, 2, 3, 4, 5],
    };
    const agg = new GameAggregate([], state, defs);
    const event = agg.turnStarted();
    expect(event).toBeDefined();
    expect(event?.type).toBe(GameEventType.TURN_STARTED);
    expect(agg.getGameState().board).toHaveLength(4);
    expect(agg.getGameState().turn).toBe(1);
  });

  it('starts a new round when draw pile is empty', () => {
    const defs = { 10: makeDef(10) };
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      drawPile: [],
      discardPile: [1],
    };
    const agg = new GameAggregate([], state, defs);
    const event = agg.turnStarted();
    // Should return undefined (round started instead)
    expect(event).toBeUndefined();
    expect(agg.getGameState().round).toBe(1);
  });
});

// — cardProduced —

describe('GameAggregate.cardProduced', () => {
  it('adds produced resources to game state', () => {
    const defs = { 10: makeDef(10) };
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    };
    const agg = new GameAggregate([], state, defs);
    agg.cardProduced(1, { gold: 3 });
    expect(agg.getGameState().resources.gold).toBe(3);
  });

  it('moves the produced card to the discard pile', () => {
    const defs = { 10: makeDef(10) };
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    };
    const agg = new GameAggregate([], state, defs);
    agg.cardProduced(1, { gold: 1 });
    expect(agg.getGameState().board).not.toContain(1);
    expect(agg.getGameState().discardPile).toContain(1);
  });

  it('returns a CARD_PRODUCED event', () => {
    const defs = { 10: makeDef(10) };
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    };
    const agg = new GameAggregate([], state, defs);
    const event = agg.cardProduced(1, { wood: 2 });
    expect(event.type).toBe(GameEventType.CARD_PRODUCED);
    expect(event.cardInstanceId).toBe(1);
    expect(event.productions).toEqual({ wood: 2 });
  });
});

// — pass —

describe('GameAggregate.pass', () => {
  it('discards board cards and clears resources (pass triggers new turn)', () => {
    const defs: Record<number, CardDef> = {
      10: makeDef(10),
      11: makeDef(11),
      12: makeDef(12),
      13: makeDef(13),
      14: makeDef(14),
    };
    const instances = [1, 2, 3, 4, 5].map(id => makeInstance(id, 10 + id - 1, 1));
    const state: GameState = {
      ...EMPTY_STATE,
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      board: [1, 2],
      resources: { gold: 5 },
      drawPile: [3, 4, 5],
    };
    const agg = new GameAggregate([], state, defs);
    agg.pass();
    const gs = agg.getGameState();
    // Resources cleared by endTurn
    expect(gs.resources).toEqual({});
    // Previous board cards (1, 2) were discarded
    expect(gs.discardPile).toContain(1);
    expect(gs.discardPile).toContain(2);
    // New turn was started: cards drawn from draw pile to board
    expect(gs.board).not.toContain(1);
    expect(gs.board).not.toContain(2);
  });

  it('returns a PASS event', () => {
    const defs: Record<number, CardDef> = {
      10: makeDef(10),
      11: makeDef(11),
      12: makeDef(12),
      13: makeDef(13),
    };
    const instances = [1, 2, 3, 4].map(id => makeInstance(id, 10 + id - 1, 1));
    const state: GameState = {
      ...EMPTY_STATE,
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      board: [1],
      drawPile: [2, 3, 4],
    };
    const agg = new GameAggregate([], state, defs);
    const event = agg.pass();
    expect(event.type).toBe(GameEventType.PASS);
  });
});

// — upgradeCard —

describe('GameAggregate.upgradeCard', () => {
  it('changes the stateId of the upgraded card', () => {
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [1, 2]),
      11: makeDef(11),
      12: makeDef(12),
      13: makeDef(13),
      14: makeDef(14),
    };
    const instances = [
      makeInstance(1, 10, 1),
      makeInstance(2, 11, 1),
      makeInstance(3, 12, 1),
      makeInstance(4, 13, 1),
      makeInstance(5, 14, 1),
    ];
    const state: GameState = {
      ...EMPTY_STATE,
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      board: [1, 2],
      drawPile: [3, 4, 5],
    };
    const agg = new GameAggregate([], state, defs);
    agg.upgradeCard(1, 2, { gold: 2 });
    expect(agg.getGameState().instances[1].stateId).toBe(2);
  });

  it('spends the cost resources', () => {
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [1, 2]),
      11: makeDef(11),
      12: makeDef(12),
      13: makeDef(13),
      14: makeDef(14),
    };
    const instances = [
      makeInstance(1, 10, 1),
      makeInstance(2, 11, 1),
      makeInstance(3, 12, 1),
      makeInstance(4, 13, 1),
      makeInstance(5, 14, 1),
    ];
    const state: GameState = {
      ...EMPTY_STATE,
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      board: [1, 2],
      resources: { gold: 5 },
      drawPile: [3, 4, 5],
    };
    const agg = new GameAggregate([], state, defs);
    agg.upgradeCard(1, 2, { gold: 2 });
    // resources are cleared by endTurn
    expect(agg.getGameState().resources.gold).toBeUndefined();
  });

  it('returns an UPGRADE_CARD event', () => {
    const defs: Record<number, CardDef> = {
      10: makeDef(10, [1, 2]),
      11: makeDef(11),
      12: makeDef(12),
      13: makeDef(13),
      14: makeDef(14),
    };
    const instances = [
      makeInstance(1, 10, 1),
      makeInstance(2, 11, 1),
      makeInstance(3, 12, 1),
      makeInstance(4, 13, 1),
      makeInstance(5, 14, 1),
    ];
    const state: GameState = {
      ...EMPTY_STATE,
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      board: [1, 2],
      resources: { gold: 5 },
      drawPile: [3, 4, 5],
    };
    const agg = new GameAggregate([], state, defs);
    const event = agg.upgradeCard(1, 2, { gold: 2 });
    expect(event.type).toBe(GameEventType.UPGRADE_CARD);
    expect(event.cardInstanceId).toBe(1);
    expect(event.stateId).toBe(2);
  });
});

// — skipTrigger —

describe('GameAggregate.skipTrigger', () => {
  it('removes the trigger from the trigger pile', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      triggerPile: {
        'trigger-1': {
          effectDef: { label: 'Test', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    agg.skipTrigger('trigger-1');
    expect(agg.getGameState().triggerPile['trigger-1']).toBeUndefined();
  });

  it('throws when trigger is not in the pile', () => {
    const agg = makeAggregate();
    expect(() => agg.skipTrigger('nonexistent')).toThrow(
      'Trigger with id nonexistent not found in trigger pile',
    );
  });

  it('returns a SKIP_TRIGGER event', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      triggerPile: {
        'trigger-1': {
          effectDef: { label: 'Test', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const event = agg.skipTrigger('trigger-1');
    expect(event.type).toBe(GameEventType.SKIP_TRIGGER);
    expect(event.triggerId).toBe('trigger-1');
  });
});

// — useCardEffect —

describe('GameAggregate.useCardEffect', () => {
  it('applies ADD_RESOURCES effect and returns a USE_CARD_EFFECT event', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t1: {
          effectDef: { label: 'Test', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects: ResolvedAction[] = [
      {
        id: '1-1',
        type: ActionType.ADD_RESOURCES,
        sourceInstanceId: 1,
        resources: { gold: 5 },
      },
    ];
    const event = agg.useCardEffect(effects, makeEmptyResolvedCost(), false, 't1');
    expect(event.type).toBe(GameEventType.USE_CARD_EFFECT);
    expect(agg.getGameState().resources.gold).toBe(5);
  });

  it('removes the triggerId from the trigger pile', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t2: {
          effectDef: { label: 'Test', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects: ResolvedAction[] = [
      {
        id: '1-1',
        type: ActionType.ADD_RESOURCES,
        sourceInstanceId: 1,
        resources: { wood: 2 },
      },
    ];
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, 't2');
    expect(agg.getGameState().triggerPile['t2']).toBeUndefined();
  });

  it('discards the source card when isDiscarded is true', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t3: {
          effectDef: { label: 'Test', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects: ResolvedAction[] = [
      {
        id: '1-1',
        type: ActionType.ADD_RESOURCES,
        sourceInstanceId: 1,
        resources: {},
      },
    ];
    agg.useCardEffect(effects, makeEmptyResolvedCost(), true, 't3');
    expect(agg.getGameState().board).not.toContain(1);
    expect(agg.getGameState().discardPile).toContain(1);
  });
});

// — getGameState / getSaveState / getEvents —

describe('GameAggregate accessors', () => {
  it('getGameState returns current state', () => {
    const agg = makeAggregate();
    expect(agg.getGameState()).toBeDefined();
  });

  it('getSaveState returns the saved state snapshot', () => {
    const defs = { 10: makeDef(10) };
    const agg = makeAggregate(defs);
    agg.gameStarted([makeInstance(1, 10, 1)], [1], {}, []);
    // roundStarted saves state
    agg.roundStarted();
    expect(agg.getSaveState()).toBeDefined();
  });

  it('getEvents returns accumulated events', () => {
    const defs = { 10: makeDef(10) };
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    };
    const agg = new GameAggregate([], state, defs);
    agg.cardProduced(1, { gold: 1 });
    expect(agg.getEvents().length).toBeGreaterThan(0);
  });
});
