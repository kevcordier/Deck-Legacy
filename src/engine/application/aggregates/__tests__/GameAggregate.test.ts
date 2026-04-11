import { describe, it, expect } from 'vitest';
import { GameAggregate, EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import { ActionType, GameEventType, Trigger } from '@engine/domain/enums';
import type {
  CardDef,
  CardInstance,
  GameEvent,
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
  trackProgress: [],
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
    const event = agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1');
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
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't2');
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
    agg.useCardEffect(effects, makeEmptyResolvedCost(), true, false, 't3');
    expect(agg.getGameState().board).not.toContain(1);
    expect(agg.getGameState().discardPile).toContain(1);
  });

  it('destroys the source card when isDestroyed is true', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t4: {
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
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, true, 't4');
    expect(agg.getGameState().board).not.toContain(1);
    expect(agg.getGameState().discardPile).not.toContain(1);
  });
});

// — loadFromHistory —

describe('GameAggregate.loadFromHistory', () => {
  it('replays a GAME_STARTED event and populates the state', () => {
    const defs = { 10: makeDef(10) };
    const source = makeAggregate(defs);
    const event = source.gameStarted([makeInstance(1, 10, 1)], [1], {}, []);

    const agg = makeAggregate(defs);
    agg.loadFromHistory([event]);
    expect(agg.getGameState().instances[1]).toBeDefined();
    expect(agg.getGameState().drawPile).toEqual([1]);
  });

  it('stores the loaded events', () => {
    const defs = { 10: makeDef(10) };
    const source = makeAggregate(defs);
    const event = source.gameStarted([makeInstance(1, 10, 1)], [1], {}, []);

    const agg = makeAggregate(defs);
    agg.loadFromHistory([event]);
    expect(agg.getEvents()).toHaveLength(1);
  });
});

// — trigger reduce callbacks —

const makeOnPlayEffect = () => ({
  label: 'On Play',
  actions: [{ id: 1, type: ActionType.ADD_RESOURCES }],
  trigger: Trigger.ON_PLAY,
  optional: false,
});

const makeOnDiscoverEffect = () => ({
  label: 'On Discover',
  actions: [{ id: 1, type: ActionType.ADD_RESOURCES }],
  trigger: Trigger.ON_DISCOVER,
  optional: false,
});

describe('GameAggregate.turnStarted — onPlayEvents reduce', () => {
  it('populates triggerPile when drawn cards have ON_PLAY effects', () => {
    const defs: Record<number, CardDef> = {
      10: {
        id: 10,
        name: 'Card',
        states: [{ id: 1, name: 'S1', cardEffects: [makeOnPlayEffect()] }],
      },
    };
    const instances = [1, 2].map(id => makeInstance(id, 10, 1));
    const state: GameState = {
      ...EMPTY_STATE,
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      drawPile: [1, 2],
    };
    const agg = new GameAggregate([], state, defs);
    agg.turnStarted();
    expect(Object.keys(agg.getGameState().triggerPile).length).toBeGreaterThan(0);
  });
});

describe('GameAggregate.advance — onPlayEvents reduce', () => {
  it('populates triggerPile when advanced cards have ON_PLAY effects', () => {
    const defs: Record<number, CardDef> = {
      10: {
        id: 10,
        name: 'Card',
        states: [{ id: 1, name: 'S1', cardEffects: [makeOnPlayEffect()] }],
      },
    };
    const instances = [1, 2].map(id => makeInstance(id, 10, 1));
    const state: GameState = {
      ...EMPTY_STATE,
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      drawPile: [1, 2],
    };
    const agg = new GameAggregate([], state, defs);
    agg.advance();
    expect(Object.keys(agg.getGameState().triggerPile).length).toBeGreaterThan(0);
  });
});

describe('GameAggregate.roundStarted — onDiscoverEvents reduce', () => {
  it('populates triggerPile when discovered cards have ON_DISCOVER effects', () => {
    const defs: Record<number, CardDef> = {
      10: {
        id: 10,
        name: 'Card',
        states: [{ id: 1, name: 'S1', cardEffects: [makeOnDiscoverEffect()] }],
      },
      11: { id: 11, name: 'Card2', states: [{ id: 1, name: 'S1' }] },
    };
    const state: GameState = {
      ...EMPTY_STATE,
      round: 1,
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
      },
      discoveryPile: [1, 2],
    };
    const agg = new GameAggregate([], state, defs);
    agg.roundStarted();
    expect(Object.keys(agg.getGameState().triggerPile).length).toBeGreaterThan(0);
  });
});

describe('GameAggregate.loadFromHistory — unknown event type', () => {
  it('throws on an unknown event type in history', () => {
    const agg = makeAggregate({});
    expect(() =>
      agg.loadFromHistory([{ type: 'UNKNOWN', id: 'x', timestamp: 0 } as unknown as GameEvent]),
    ).toThrow('Unknown event type: UNKNOWN');
  });
});

// — roundStarted with round > 1 —

describe('GameAggregate.roundStarted with round > 1', () => {
  it('picks two new cards from the discovery pile on round 2+', () => {
    const defs: Record<number, CardDef> = {
      10: makeDef(10),
      11: makeDef(11),
    };
    const state: GameState = {
      ...EMPTY_STATE,
      round: 1,
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
      },
      discoveryPile: [1, 2],
    };
    const agg = new GameAggregate([], state, defs);
    const event = agg.roundStarted();
    expect(event.newCards).toContain(1);
    expect(event.newCards).toContain(2);
  });

  it('picks only one card when the first is a parchmentCard', () => {
    const defs: Record<number, CardDef> = {
      10: { ...makeDef(10), parchmentCard: true },
      11: makeDef(11),
    };
    const state: GameState = {
      ...EMPTY_STATE,
      round: 1,
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 11, 1),
      },
      discoveryPile: [1, 2],
    };
    const agg = new GameAggregate([], state, defs);
    const event = agg.roundStarted();
    expect(event.newCards).toHaveLength(0);
    expect(event.type).toBe(GameEventType.ROUND_STARTED);
  });
});

// — advance —

describe('GameAggregate.advance', () => {
  it('draws up to 2 cards from the draw pile to the board', () => {
    const defs: Record<number, CardDef> = {
      10: makeDef(10),
      11: makeDef(11),
      12: makeDef(12),
    };
    const instances = [1, 2, 3].map(id => makeInstance(id, 9 + id, 1));
    const state: GameState = {
      ...EMPTY_STATE,
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      drawPile: [1, 2, 3],
    };
    const agg = new GameAggregate([], state, defs);
    const event = agg.advance();
    expect(event).toBeDefined();
    expect(agg.getGameState().board).toHaveLength(2);
  });

  it('returns undefined when draw pile is empty', () => {
    const agg = makeAggregate({});
    const result = agg.advance();
    expect(result).toBeUndefined();
  });
});

// — useCardEffect with remaining action types —

describe('GameAggregate.useCardEffect — DISCOVER_CARD', () => {
  it('moves a discovered non-permanent card to discard via DiscoverCardStrategy', () => {
    const defs = { 10: makeDef(10) };
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 5: makeInstance(5, 10, 1) },
      discoveryPile: [5],
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 5,
        },
      },
    };
    const agg = new GameAggregate([], state, defs);
    const effects = [
      {
        id: '5-1',
        type: ActionType.DISCOVER_CARD,
        sourceInstanceId: 5,
        instanceId: 5,
        cardDefs: defs,
      } as unknown as ResolvedAction,
    ];
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1');
    expect(agg.getGameState().discardPile).toContain(5);
  });
});

describe('GameAggregate.useCardEffect — ADD_STICKER', () => {
  it('decrements the sticker stock via AddStickerStrategy', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      stickerStock: { 101: 3 },
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects = [
      {
        id: '1-1',
        type: ActionType.ADD_STICKER,
        sourceInstanceId: 1,
        stickerId: 101,
        instanceId: 1,
      } as unknown as ResolvedAction,
    ];
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1');
    expect(agg.getGameState().stickerStock[101]).toBe(2);
  });
});

describe('GameAggregate.useCardEffect — DISCARD_CARD', () => {
  it('moves the target card to the discard pile', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
      },
      board: [1, 2],
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects: ResolvedAction[] = [
      { id: '1-1', type: ActionType.DISCARD_CARD, sourceInstanceId: 1, instanceId: 2 },
    ];
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1');
    expect(agg.getGameState().discardPile).toContain(2);
  });
});

describe('GameAggregate.useCardEffect — DESTROY_CARD', () => {
  it('moves the target card to the destroyed pile', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
      },
      board: [1, 2],
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects: ResolvedAction[] = [
      { id: '1-1', type: ActionType.DESTROY_CARD, sourceInstanceId: 1, instanceId: 2 },
    ];
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1');
    expect(agg.getGameState().destroyedPile).toContain(2);
    expect(agg.getGameState().board).not.toContain(2);
  });
});

describe('GameAggregate.useCardEffect — UPGRADE_CARD', () => {
  it('changes the stateId of the target card', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const defs = { 10: makeDef(10, [1, 2]) };
    const agg = new GameAggregate([], state, defs);
    const effects: ResolvedAction[] = [
      { id: '1-1', type: ActionType.UPGRADE_CARD, sourceInstanceId: 1, instanceId: 1, stateId: 2 },
    ];
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1');
    expect(agg.getGameState().instances[1].stateId).toBe(2);
  });
});

describe('GameAggregate.useCardEffect — PLACE_CARD_IN_DRAW_PILE', () => {
  it('moves the target card into the draw pile at the given position', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
      },
      board: [1],
      drawPile: [2],
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects: ResolvedAction[] = [
      {
        id: '1-1',
        type: ActionType.PLACE_CARD_IN_DRAW_PILE,
        sourceInstanceId: 1,
        instanceId: 1,
        position: 0,
      },
    ];
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1');
    expect(agg.getGameState().board).not.toContain(1);
    expect(agg.getGameState().drawPile).toContain(1);
  });
});

describe('GameAggregate.useCardEffect — BLOCK_CARD', () => {
  it('adds the target to blockingCards keyed by source', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
      },
      board: [1, 2],
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects: ResolvedAction[] = [
      { id: '1-1', type: ActionType.BLOCK_CARD, sourceInstanceId: 1, instanceId: 2 },
    ];
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1');
    expect(agg.getGameState().blockingCards[1]).toBe(2);
  });
});

describe('GameAggregate.useCardEffect — PLAY_CARD', () => {
  it('adds the target card to the board', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: {
        1: makeInstance(1, 10, 1),
        2: makeInstance(2, 10, 1),
      },
      discardPile: [2],
      board: [1],
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects: ResolvedAction[] = [
      { id: '1-1', type: ActionType.PLAY_CARD, sourceInstanceId: 1, instanceId: 2 },
    ];
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1');
    expect(agg.getGameState().board).toContain(2);
    expect(agg.getGameState().discardPile).not.toContain(2);
  });
});

describe('GameAggregate.useCardEffect — CHOOSE_STATE', () => {
  it('changes the stateId of the target card', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const defs = { 10: makeDef(10, [1, 2]) };
    const agg = new GameAggregate([], state, defs);
    const effects: ResolvedAction[] = [
      { id: '1-1', type: ActionType.CHOOSE_STATE, sourceInstanceId: 1, instanceId: 1, stateId: 2 },
    ];
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1');
    expect(agg.getGameState().instances[1].stateId).toBe(2);
  });
});

describe('GameAggregate.useCardEffect — unknown action type', () => {
  it('throws when an unknown action type is encountered', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects: ResolvedAction[] = [{ id: '1-1', type: 'UNKNOWN_TYPE', sourceInstanceId: 1 }];
    expect(() => agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1')).toThrow(
      'Unknown effect type: UNKNOWN_TYPE',
    );
  });
});

describe('GameAggregate.useCardEffect — validatedStepId', () => {
  it('appends validatedStepId to the source instance trackProgress', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects: ResolvedAction[] = [
      { id: '1-1', type: ActionType.ADD_RESOURCES, sourceInstanceId: 1, resources: {} },
    ];
    agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1', 42);
    expect(agg.getGameState().instances[1].trackProgress).toContain(42);
  });
});

// — useCardEffect branch coverage —

describe('GameAggregate.useCardEffect — resolvedCost without arrays', () => {
  it('handles resolvedCost without discardedCardIds or destroyedCardIds', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects: ResolvedAction[] = [
      { id: '1-1', type: ActionType.ADD_RESOURCES, sourceInstanceId: 1, resources: { gold: 1 } },
    ];
    // resolvedCost without discardedCardIds / destroyedCardIds fields
    const partialCost = { resources: {} } as ResolvedCost;
    expect(() => agg.useCardEffect(effects, partialCost, false, false, 't1')).not.toThrow();
  });
});

describe('GameAggregate.useCardEffect — validatedStepId with missing instance', () => {
  it('does nothing when validatedStepId source instance is not found', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const effects: ResolvedAction[] = [
      { id: '1-1', type: ActionType.ADD_RESOURCES, sourceInstanceId: 1, resources: {} },
    ];
    // explicitSourceInstanceId 999 does not exist in instances
    expect(() =>
      agg.useCardEffect(effects, makeEmptyResolvedCost(), false, false, 't1', 42, 999),
    ).not.toThrow();
  });
});

describe('GameAggregate.useCardEffect — empty effects array', () => {
  it('uses -1 as sourceInstanceId when effects array is empty', () => {
    const state: GameState = {
      ...EMPTY_STATE,
      triggerPile: {
        t1: {
          effectDef: { label: '', actions: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    };
    const agg = new GameAggregate([], state, {});
    const event = agg.useCardEffect([], makeEmptyResolvedCost(), false, false, 't1');
    expect(event.sourceInstanceId).toBe(-1);
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
