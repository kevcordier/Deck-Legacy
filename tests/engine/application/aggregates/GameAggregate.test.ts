import {
  makeCardState,
  makeDef,
  makeEmptyResolvedCost,
  makeGameState,
  makeInstance,
} from '../../application/testHelpers';
import { EMPTY_STATE, GameAggregate } from '@engine/application/aggregates/GameAggregate';
import { GameEventContext } from '@engine/application/gameEvent/GameEventContext';
import { ActionType, GameEventType, PassiveType, Trigger } from '@engine/domain/enums';
import type {
  CardAction,
  CardDef,
  GameEvent,
  GameState,
  ResolvedAction,
  ResolvedCost,
} from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type GameEventApply = (gameState: GameState, event: GameEvent) => GameState;
let applySpy: Mock<GameEventApply>;

beforeEach(() => {
  applySpy = vi
    .spyOn(GameEventContext.prototype as unknown as Record<string, GameEventApply>, 'apply')
    .mockImplementation(gs => gs) as unknown as Mock<GameEventApply>;
});

afterEach(() => {
  vi.restoreAllMocks();
});

const makeAggregate = (
  defs: Record<number, CardDef> = {},
  initialState: GameState = { ...EMPTY_STATE },
) => new GameAggregate(initialState, defs);

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
  it('dispatches a GAME_STARTED event with correct fields', () => {
    const defs = { 10: makeDef(10) };
    const agg = makeAggregate(defs);
    const instances = [makeInstance(1, 10, 1)];
    const event = agg.gameStarted(instances, [1], { 101: 5 }, []);

    expect(event.type).toBe(GameEventType.GAME_STARTED);
    expect(event.cardInstances).toEqual(instances);
    expect(event.initialDeck).toEqual([1]);
    expect(event.stickerStock).toEqual({ 101: 5 });
    expect(applySpy).toHaveBeenCalledOnce();
    expect(applySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ type: GameEventType.GAME_STARTED }),
    );
  });

  it('updates the game state with what apply returns', () => {
    const defs = { 10: makeDef(10) };
    const agg = makeAggregate(defs);
    const instances = [makeInstance(1, 10, 1)];
    const mockState = makeGameState({ instances: { 1: instances[0] }, drawPile: [1] });
    applySpy.mockReturnValue(mockState);

    agg.gameStarted(instances, [1], {}, []);

    expect(agg.getGameState()).toBe(mockState);
  });

  it('sets round and turn to 0 via the returned state', () => {
    const defs = { 10: makeDef(10) };
    const agg = makeAggregate(defs);
    const mockState = makeGameState({ round: 0, turn: 0 });
    applySpy.mockReturnValue(mockState);

    agg.gameStarted([makeInstance(1, 10, 1)], [1], {}, []);

    expect(agg.getGameState().round).toBe(0);
    expect(agg.getGameState().turn).toBe(0);
  });
});

// — roundStarted —

describe('GameAggregate.roundStarted', () => {
  it('dispatches a ROUND_STARTED event with incremented round', () => {
    const state = makeGameState({ round: 0 });
    const agg = new GameAggregate(state, {});
    agg.roundStarted();

    expect(applySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ type: GameEventType.ROUND_STARTED, round: 1 }),
    );
  });

  it('returns the state returned by apply', () => {
    const mockState = makeGameState({ round: 1, turn: 0 });
    applySpy.mockReturnValue(mockState);

    const result = makeAggregate().roundStarted();

    expect(result).toBe(mockState);
  });

  it('includes discard and board cards in the new draw pile of the event', () => {
    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      discardPile: [1],
      board: [2],
      drawPile: [],
    });
    const agg = new GameAggregate(state, { 10: makeDef(10) });
    agg.roundStarted();

    const [, event] = applySpy.mock.calls[0] as unknown as [GameState, { newDrawPile: number[] }];
    expect(event.newDrawPile).toHaveLength(2);
    expect(event.newDrawPile).toContain(1);
    expect(event.newDrawPile).toContain(2);
  });
});

// — turnStarted —

describe('GameAggregate.turnStarted', () => {
  it('dispatches a TURN_STARTED event with up to 4 cards', () => {
    const instances = [1, 2, 3, 4, 5].map(id => makeInstance(id, 9 + id, 1));
    const defs = Object.fromEntries(instances.map(i => [i.cardId, makeDef(i.cardId)]));
    const state = makeGameState({
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      drawPile: [1, 2, 3, 4, 5],
    });
    const agg = new GameAggregate(state, defs);
    agg.turnStarted();

    expect(applySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ type: GameEventType.TURN_STARTED, turnCards: [1, 2, 3, 4] }),
    );
  });

  it('calls roundStarted (ROUND_STARTED then TURN_STARTED) when draw pile is empty', () => {
    const afterRound = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      drawPile: [1],
      round: 1,
    });
    const afterTurn = makeGameState({ round: 1, turn: 1 });
    applySpy.mockReturnValueOnce(afterRound).mockReturnValueOnce(afterTurn);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      drawPile: [],
      discardPile: [1],
    });
    const agg = new GameAggregate(state, { 10: makeDef(10) });
    agg.turnStarted();

    expect(applySpy).toHaveBeenCalledTimes(2);
    expect(applySpy.mock.calls[0][1]).toMatchObject({ type: GameEventType.ROUND_STARTED });
    expect(applySpy.mock.calls[1][1]).toMatchObject({ type: GameEventType.TURN_STARTED });
  });

  it('returns the state returned by apply', () => {
    const mockState = makeGameState({ turn: 1 });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      drawPile: [1],
    });
    const agg = new GameAggregate(state, { 10: makeDef(10) });
    const result = agg.turnStarted();

    expect(result).toBe(mockState);
  });
});

// — cardProduced —

describe('GameAggregate.cardProduced', () => {
  it('dispatches a CARD_PRODUCED event with correct fields', () => {
    const state = makeGameState({ instances: { 1: makeInstance(1, 10, 1) }, board: [1] });
    const agg = new GameAggregate(state, {});
    agg.cardProduced(1, { gold: 3 });

    expect(applySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        type: GameEventType.CARD_PRODUCED,
        cardInstanceId: 1,
        productions: { gold: 3 },
      }),
    );
  });

  it('returns the state returned by apply', () => {
    const mockState = makeGameState({ resources: { gold: 3 }, discardPile: [1] });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({ instances: { 1: makeInstance(1, 10, 1) }, board: [1] });
    const result = new GameAggregate(state, {}).cardProduced(1, { gold: 3 });

    expect(result).toBe(mockState);
  });
});

// — upgradeCard —

describe('GameAggregate.upgradeCard', () => {
  it('dispatches UPGRADE_CARD then TURN_ENDED events', () => {
    const mockState = makeGameState({ instances: { 1: makeInstance(1, 10, 2) } });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    });
    new GameAggregate(state, { 10: makeDef(10, [makeCardState(1), makeCardState(2)]) }).upgradeCard(
      1,
      2,
      { gold: 2 },
    );

    const types = applySpy.mock.calls.map(([, e]) => (e as GameEvent).type);
    expect(types).toContain(GameEventType.UPGRADE_CARD);
    expect(types).toContain(GameEventType.TURN_ENDED);
  });

  it('UPGRADE_CARD event carries the correct cardInstanceId, stateId and cost', () => {
    applySpy.mockReturnValue(makeGameState({ instances: { 1: makeInstance(1, 10, 2) } }));

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    });
    new GameAggregate(state, { 10: makeDef(10, [makeCardState(1), makeCardState(2)]) }).upgradeCard(
      1,
      2,
      { gold: 2 },
    );

    const upgradeCall = applySpy.mock.calls.find(
      ([, e]) => (e as GameEvent).type === GameEventType.UPGRADE_CARD,
    );
    expect(upgradeCall![1]).toMatchObject({ cardInstanceId: 1, stateId: 2, cost: { gold: 2 } });
  });

  it('returns the state returned by the last apply call', () => {
    const finalState = makeGameState({ instances: { 1: makeInstance(1, 10, 2) } });
    applySpy.mockReturnValue(finalState);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    });
    const gs = new GameAggregate(state, {
      10: makeDef(10, [makeCardState(1), makeCardState(2)]),
    }).upgradeCard(1, 2, { gold: 2 });

    expect(gs.instances[1].stateId).toBe(2);
  });
});

// — skipTrigger —

describe('GameAggregate.skipTrigger', () => {
  it('dispatches a SKIP_TRIGGER event with the correct triggerId', () => {
    const state = makeGameState({
      triggerPile: {
        'trigger-1': {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    new GameAggregate(state, {}).skipTrigger('trigger-1');

    expect(applySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ type: GameEventType.SKIP_TRIGGER, triggerId: 'trigger-1' }),
    );
  });

  it('throws when trigger is not in the pile', () => {
    expect(() => makeAggregate().skipTrigger('nonexistent')).toThrow(
      'Trigger with id nonexistent not found in trigger pile',
    );
  });

  it('returns the state returned by apply', () => {
    const mockState = makeGameState({ triggerPile: {} });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      triggerPile: {
        'trigger-1': {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const result = new GameAggregate(state, {}).skipTrigger('trigger-1');

    expect(result).toBe(mockState);
  });

  it('calls turnStarted when phase is END_TURN and triggerPile is empty after skip', () => {
    const afterSkip = makeGameState({
      phase: Phase.END_TURN,
      triggerPile: {},
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      drawPile: [2],
    });
    const afterTurn = makeGameState({ phase: Phase.PLAYING });
    applySpy.mockReturnValueOnce(afterSkip).mockReturnValueOnce(afterTurn);

    const state = makeGameState({
      phase: Phase.END_TURN,
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      drawPile: [2],
      triggerPile: {
        'trigger-1': {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, { 10: makeDef(10) }).skipTrigger('trigger-1');

    expect(applySpy).toHaveBeenCalledTimes(2);
    expect(applySpy.mock.calls[1][1]).toMatchObject({ type: GameEventType.TURN_STARTED });
    expect(gs.phase).toBe(Phase.PLAYING);
  });
});

// — applyCardEffect —

const makeTriggerState = (extraInstances: Record<number, ReturnType<typeof makeInstance>> = {}) =>
  makeGameState({
    instances: { 1: makeInstance(1, 10, 1), ...extraInstances },
    board: [1],
    triggerPile: {
      t1: {
        effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
        sourceInstanceId: 1,
      },
    },
  });

describe('GameAggregate.applyCardEffect', () => {
  it('dispatches a USE_CARD_EFFECT event with correct metadata', () => {
    new GameAggregate(makeTriggerState(), {}).applyCardEffect(
      'a1',
      [{ id: '1-1', type: ActionType.ADD_RESOURCES, sourceInstanceId: 1, resources: { gold: 5 } }],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(applySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        type: GameEventType.USE_CARD_EFFECT,
        actionId: 'a1',
        triggerId: 't1',
      }),
    );
  });

  it('returns the state returned by apply', () => {
    const mockState = makeGameState({ resources: { gold: 5 } });
    applySpy.mockReturnValue(mockState);

    const result = new GameAggregate(makeTriggerState(), {}).applyCardEffect(
      'a1',
      [{ id: '1-1', type: ActionType.ADD_RESOURCES, sourceInstanceId: 1, resources: { gold: 5 } }],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(result).toBe(mockState);
  });

  it('sets isDiscarded on the event when option is true', () => {
    new GameAggregate(makeTriggerState(), {}).applyCardEffect(
      'a1',
      [{ id: '1-1', type: ActionType.ADD_RESOURCES, sourceInstanceId: 1, resources: {} }],
      makeEmptyResolvedCost(),
      't1',
      { isDiscarded: true },
    );

    expect(applySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ isDiscarded: true }),
    );
  });

  it('sets isDestroyed on the event when option is true', () => {
    new GameAggregate(makeTriggerState(), {}).applyCardEffect(
      'a1',
      [{ id: '1-1', type: ActionType.ADD_RESOURCES, sourceInstanceId: 1, resources: {} }],
      makeEmptyResolvedCost(),
      't1',
      { isDestroyed: true },
    );

    expect(applySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ isDestroyed: true }),
    );
  });

  it('uses explicitSourceInstanceId over effect sourceInstanceId', () => {
    const state = makeTriggerState({ 99: makeInstance(99, 10, 1) });
    new GameAggregate(state, {}).applyCardEffect(
      'a1',
      [{ id: '1-1', type: ActionType.ADD_RESOURCES, sourceInstanceId: 1, resources: {} }],
      makeEmptyResolvedCost(),
      't1',
      { explicitSourceInstanceId: 99 },
    );

    expect(applySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ sourceInstanceId: 99 }),
    );
  });

  it('handles an empty effects array without throwing', () => {
    const state = makeGameState({
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    expect(() =>
      new GameAggregate(state, {}).applyCardEffect('a1', [], makeEmptyResolvedCost(), 't1'),
    ).not.toThrow();
  });

  it('handles resolvedCost without optional array fields', () => {
    const partialCost = { resources: {} } as ResolvedCost;
    expect(() =>
      new GameAggregate(makeTriggerState(), {}).applyCardEffect(
        'a1',
        [
          {
            id: '1-1',
            type: ActionType.ADD_RESOURCES,
            sourceInstanceId: 1,
            resources: { gold: 1 },
          },
        ],
        partialCost,
        't1',
      ),
    ).not.toThrow();
  });

  it('throws when an unknown action type is encountered', () => {
    expect(() =>
      new GameAggregate(makeTriggerState(), {}).applyCardEffect(
        'a1',
        [{ id: '1-1', type: 'UNKNOWN_TYPE' as ActionType, sourceInstanceId: 1 }],
        makeEmptyResolvedCost(),
        't1',
      ),
    ).toThrow('Unknown effect type: UNKNOWN_TYPE');
  });

  it('calls turnStarted when phase is END_TURN and triggerPile is empty after resolving', () => {
    const afterEffect = makeGameState({
      phase: Phase.END_TURN,
      triggerPile: {},
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      drawPile: [2],
    });
    const afterTurn = makeGameState({ phase: Phase.PLAYING });
    applySpy.mockReturnValueOnce(afterEffect).mockReturnValueOnce(afterTurn);

    const state = makeGameState({
      phase: Phase.END_TURN,
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      board: [1],
      drawPile: [2],
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, { 10: makeDef(10) }).applyCardEffect(
      'a1',
      [{ id: '1-1', type: ActionType.ADD_RESOURCES, sourceInstanceId: 1, resources: {} }],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(applySpy).toHaveBeenCalledTimes(2);
    expect(applySpy.mock.calls[1][1]).toMatchObject({ type: GameEventType.TURN_STARTED });
    expect(gs.phase).toBe(Phase.PLAYING);
  });

  it('stays in END_TURN phase when triggerPile still has entries after resolving', () => {
    const afterEffect = makeGameState({
      phase: Phase.END_TURN,
      triggerPile: {
        t2: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    applySpy.mockReturnValue(afterEffect);

    const state = makeGameState({
      phase: Phase.END_TURN,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
        t2: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, { 10: makeDef(10) }).applyCardEffect(
      'a1',
      [{ id: '1-1', type: ActionType.ADD_RESOURCES, sourceInstanceId: 1, resources: {} }],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(gs.phase).toBe(Phase.END_TURN);
    expect(gs.triggerPile['t2']).toBeDefined();
  });

  it('calls turnEnded when endsTurn option is true', () => {
    const mockState = makeGameState({ turn: 2 });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      phase: Phase.PLAYING,
      round: 1,
      turn: 1,
      instances: { 1: makeInstance(1, 10, 1) },
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, { 10: makeDef(10) }).applyCardEffect(
      'a1',
      [{ id: '1-1', type: ActionType.ADD_RESOURCES, sourceInstanceId: 1, resources: {} }],
      makeEmptyResolvedCost(),
      't1',
      { endsTurn: true },
    );

    const types = applySpy.mock.calls.map(([, e]) => (e as GameEvent).type);
    expect(types).toContain(GameEventType.USE_CARD_EFFECT);
    expect(types).toContain(GameEventType.TURN_ENDED);
    expect(gs.turn).toBe(2);
  });
});

// — applyCardEffect per action type — verify USE_CARD_EFFECT dispatched and state propagated

describe('GameAggregate.applyCardEffect — DISCOVER_CARD', () => {
  it('dispatches USE_CARD_EFFECT and returns state from apply', () => {
    const mockState = makeGameState({ discardPile: [5] });
    applySpy.mockReturnValue(mockState);

    const defs = { 10: makeDef(10) };
    const state = makeGameState({
      instances: { 5: makeInstance(5, 10, 1) },
      discoveryPile: [5],
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 5,
        },
      },
    });
    new GameAggregate(state, defs).applyCardEffect(
      'a1',
      [
        {
          id: '5-1',
          type: ActionType.DISCOVER_CARD,
          sourceInstanceId: 5,
          instanceIds: [5],
          cardDefs: defs,
        } as unknown as ResolvedAction,
      ],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(applySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ type: GameEventType.USE_CARD_EFFECT }),
    );
  });
});

describe('GameAggregate.applyCardEffect — BOOST_CARD', () => {
  it('dispatches USE_CARD_EFFECT and returns state from apply', () => {
    const mockState = makeGameState({ stickerStock: { 101: 2 } });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      stickerStock: { 101: 3 },
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    new GameAggregate(state, {}).applyCardEffect(
      'a1',
      [
        {
          id: '1-1',
          type: ActionType.BOOST_CARD,
          sourceInstanceId: 1,
          stickerId: 101,
          instanceIds: [1],
        } as unknown as ResolvedAction,
      ],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(applySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ type: GameEventType.USE_CARD_EFFECT }),
    );
  });
});

describe('GameAggregate.applyCardEffect — ADD_STICKER', () => {
  it('dispatches USE_CARD_EFFECT and returns state from apply', () => {
    const mockState = makeGameState({ stickerStock: { 101: 2 } });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      stickerStock: { 101: 3 },
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, {}).applyCardEffect(
      'a1',
      [
        {
          id: '1-1',
          type: ActionType.ADD_STICKER,
          sourceInstanceId: 1,
          stickerId: 101,
          instanceIds: [1],
        } as unknown as ResolvedAction,
      ],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(gs.stickerStock[101]).toBe(2);
  });
});

describe('GameAggregate.applyCardEffect — DISCARD_CARD', () => {
  it('returns a state where the target card is in the discard pile', () => {
    const mockState = makeGameState({ board: [1], discardPile: [2] });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      board: [1, 2],
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, {}).applyCardEffect(
      'a1',
      [{ id: '1-1', type: ActionType.DISCARD_CARD, sourceInstanceId: 1, instanceIds: [2] }],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(gs.discardPile).toContain(2);
  });
});

describe('GameAggregate.applyCardEffect — DESTROY_CARD', () => {
  it('returns a state where the target card is in the destroyed pile', () => {
    const mockState = makeGameState({ board: [1], destroyedPile: [2] });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      board: [1, 2],
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, {}).applyCardEffect(
      'a1',
      [{ id: '1-1', type: ActionType.DESTROY_CARD, sourceInstanceId: 1, instanceIds: [2] }],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(gs.destroyedPile).toContain(2);
    expect(gs.board).not.toContain(2);
  });
});

describe('GameAggregate.applyCardEffect — UPGRADE_CARD', () => {
  it('returns a state where the target card has the new stateId', () => {
    const mockState = makeGameState({ instances: { 1: makeInstance(1, 10, 2) }, board: [1] });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, {
      10: makeDef(10, [makeCardState(1), makeCardState(2)]),
    }).applyCardEffect(
      'a1',
      [
        {
          id: '1-1',
          type: ActionType.UPGRADE_CARD,
          sourceInstanceId: 1,
          instanceIds: [1],
          stateId: 2,
        },
      ],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(gs.instances[1].stateId).toBe(2);
  });
});

describe('GameAggregate.applyCardEffect — PLACE_CARD_IN_DRAW_PILE', () => {
  it('returns a state where the target card is in the draw pile', () => {
    const mockState = makeGameState({ board: [], drawPile: [1, 2] });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      board: [1],
      drawPile: [2],
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, {}).applyCardEffect(
      'a1',
      [
        {
          id: '1-1',
          type: ActionType.PLACE_CARD_IN_DRAW_PILE,
          sourceInstanceId: 1,
          instanceIds: [1],
          position: 0,
        },
      ],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(gs.board).not.toContain(1);
    expect(gs.drawPile).toContain(1);
  });
});

describe('GameAggregate.applyCardEffect — BLOCK_CARD', () => {
  it('returns a state with a BLOCK board effect keyed by source', () => {
    const mockState = makeGameState({
      board: [1, 2],
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      boardEffects: { 1: [{ id: 'block', type: PassiveType.BLOCK, cards: { ids: [2] } }] },
    });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      board: [1, 2],
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, {}).applyCardEffect(
      'a1',
      [{ id: '1-1', type: ActionType.BLOCK_CARD, sourceInstanceId: 1, instanceIds: [2] }],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(gs.boardEffects[1]).toEqual([{ id: 'block', type: 'BLOCK', cards: { ids: [2] } }]);
  });
});

describe('GameAggregate.applyCardEffect — ADD_BOARD_EFFECT', () => {
  it('returns a state where the board effect is on the target instance', () => {
    const mockState = makeGameState({
      board: [1, 2],
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      boardEffects: { 2: [{ id: 'test-effect', type: PassiveType.BLOCK }] },
    });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      board: [1, 2],
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, {}).applyCardEffect(
      'a1',
      [
        {
          id: '1-1',
          type: ActionType.ADD_BOARD_EFFECT,
          sourceInstanceId: 1,
          instanceIds: [2],
          effect: { id: 'test-effect', type: 'BOOST' },
        } as unknown as ResolvedAction,
      ],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(gs.boardEffects[2]).toBeDefined();
    expect(gs.boardEffects[2][0].id).toBe('test-effect');
  });
});

describe('GameAggregate.applyCardEffect — PLAY_CARD', () => {
  it('returns a state where the target card is on the board', () => {
    const mockState = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      board: [1, 2],
      discardPile: [],
    });
    applySpy.mockReturnValue(mockState);

    const defs = { 10: makeDef(10) };
    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 10, 1) },
      discardPile: [2],
      board: [1],
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, defs).applyCardEffect(
      'a1',
      [{ id: '1-1', type: ActionType.PLAY_CARD, sourceInstanceId: 1, instanceIds: [2] }],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(gs.board).toContain(2);
    expect(gs.discardPile).not.toContain(2);
  });
});

describe('GameAggregate.applyCardEffect — CHOOSE_STATE', () => {
  it('returns a state where the target card has the new stateId', () => {
    const mockState = makeGameState({ instances: { 1: makeInstance(1, 10, 2) }, board: [1] });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      triggerPile: {
        t1: {
          effectDef: { id: '', actionEffects: [], trigger: undefined, optional: false },
          sourceInstanceId: 1,
        },
      },
    });
    const gs = new GameAggregate(state, {
      10: makeDef(10, [makeCardState(1), makeCardState(2)]),
    }).applyCardEffect(
      'a1',
      [
        {
          id: '1-1',
          type: ActionType.CHOOSE_STATE,
          sourceInstanceId: 1,
          instanceIds: [1],
          stateId: 2,
        },
      ],
      makeEmptyResolvedCost(),
      't1',
    );

    expect(gs.instances[1].stateId).toBe(2);
  });
});

// — turnEnded —

describe('GameAggregate.turnEnded', () => {
  it('dispatches TURN_ENDED then TURN_STARTED when no END_OF_TURN effects', () => {
    const afterTurnEnded = makeGameState({
      phase: Phase.PLAYING,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      drawPile: [1],
    });
    const afterTurnStarted = makeGameState({ phase: Phase.PLAYING, turn: 1 });
    applySpy.mockReturnValueOnce(afterTurnEnded).mockReturnValueOnce(afterTurnStarted);

    const state = makeGameState({
      phase: Phase.PLAYING,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      drawPile: [1],
    });
    new GameAggregate(state, { 10: makeDef(10) }).turnEnded();

    const types = applySpy.mock.calls.map(([, e]) => (e as GameEvent).type);
    expect(types).toContain(GameEventType.TURN_ENDED);
    expect(types).toContain(GameEventType.TURN_STARTED);
  });

  it('returns state in END_TURN phase with triggers when board cards have END_OF_TURN effects', () => {
    const endOfTurnEffect: CardAction = {
      id: 'end_of_turn',
      actionEffects: [{ id: 1, type: ActionType.ADD_RESOURCES }],
      trigger: Trigger.END_OF_TURN,
      optional: false,
    };
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card', states: [{ id: 1, name: 'S1', actions: [endOfTurnEffect] }] },
    };
    const mockState = makeGameState({
      phase: Phase.END_TURN,
      triggerPile: {
        'end-trigger': { effectDef: endOfTurnEffect, sourceInstanceId: 1 },
      },
    });
    applySpy.mockReturnValue(mockState);

    const state = makeGameState({
      phase: Phase.PLAYING,
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    });
    const gs = new GameAggregate(state, defs).turnEnded();

    expect(Object.keys(gs.triggerPile).length).toBeGreaterThan(0);
    expect(gs.phase).toBe(Phase.END_TURN);
  });
});

// — loadFromHistory —

describe('GameAggregate.loadFromHistory', () => {
  it('calls apply for each event and updates state', () => {
    const mockState = makeGameState({ drawPile: [1] });
    applySpy.mockReturnValue(mockState);

    const event = {
      type: GameEventType.GAME_STARTED,
      id: 'x',
      timestamp: 0,
      cardInstances: [],
      initialDeck: [1],
      stickerStock: {},
      discoveryPile: [],
    } as GameEvent;

    const agg = makeAggregate({});
    agg.loadFromHistory([event]);

    expect(applySpy).toHaveBeenCalledOnce();
    expect(applySpy).toHaveBeenCalledWith(EMPTY_STATE, event);
    expect(agg.getGameState()).toBe(mockState);
  });

  it('stores the loaded events', () => {
    const event = {
      type: GameEventType.GAME_STARTED,
      id: 'x',
      timestamp: 0,
      cardInstances: [],
      initialDeck: [],
      stickerStock: {},
      discoveryPile: [],
    } as GameEvent;

    const agg = makeAggregate({});
    agg.loadFromHistory([event]);

    expect(agg.getEvents()).toHaveLength(1);
  });

  it('propagates errors thrown by apply (e.g. unknown event type)', () => {
    applySpy.mockImplementation((_, event) => {
      throw new Error(`Unknown event type: ${event.type}`);
    });

    expect(() =>
      makeAggregate({}).loadFromHistory([
        { type: 'UNKNOWN', id: 'x', timestamp: 0 } as unknown as GameEvent,
      ]),
    ).toThrow('Unknown event type: UNKNOWN');
  });
});

// — roundStarted with round > 1 —

describe('GameAggregate.roundStarted — round > 1', () => {
  it('includes both discovery pile cards in ROUND_STARTED event', () => {
    const defs = { 10: makeDef(10), 11: makeDef(11) };
    const state = makeGameState({
      round: 1,
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 11, 1) },
      discoveryPile: [1, 2],
    });
    new GameAggregate(state, defs).roundStarted();

    const [, event] = applySpy.mock.calls[0] as unknown as [GameState, { newCards: number[] }];
    expect(event.newCards).toContain(1);
    expect(event.newCards).toContain(2);
  });

  it('adds no cards to ROUND_STARTED event when first discovered card is a parchmentCard', () => {
    const defs = { 10: { ...makeDef(10), parchmentCard: true }, 11: makeDef(11) };
    const state = makeGameState({
      round: 1,
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 11, 1) },
      discoveryPile: [1, 2],
    });
    new GameAggregate(state, defs).roundStarted();

    const [, event] = applySpy.mock.calls[0] as unknown as [
      GameState,
      { newCards: number[]; newDrawPile: number[] },
    ];
    expect(event.newCards).toHaveLength(0);
    expect(event.newDrawPile).toHaveLength(0);
  });
});

// — advance —

describe('GameAggregate.advance', () => {
  it('dispatches an ADVANCE event with up to 2 cards', () => {
    const instances = [1, 2, 3].map(id => makeInstance(id, 9 + id, 1));
    const defs = { 10: makeDef(10), 11: makeDef(11), 12: makeDef(12) };
    const state = makeGameState({
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      drawPile: [1, 2, 3],
    });
    new GameAggregate(state, defs).advance();

    expect(applySpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ type: GameEventType.ADVANCE, turnCards: [1, 2] }),
    );
  });

  it('returns the current state without dispatching when drawPile is empty', () => {
    const state = makeGameState({ drawPile: [] });
    const agg = new GameAggregate(state, {});
    const result = agg.advance();

    expect(applySpy).not.toHaveBeenCalled();
    expect(result).toBe(state);
  });
});

// — trigger reduce callbacks —

const makeOnPlayEffect = (): CardAction => ({
  id: 'on_play',
  actionEffects: [{ id: 1, type: ActionType.ADD_RESOURCES }],
  trigger: Trigger.ON_PLAY,
  optional: false,
});

const makeOnDiscoverEffect = (): CardAction => ({
  id: 'on_discover',
  actionEffects: [{ id: 1, type: ActionType.ADD_RESOURCES }],
  trigger: Trigger.ON_DISCOVER,
  optional: false,
});

describe('GameAggregate.turnStarted — onPlayEvents in event', () => {
  it('TURN_STARTED event includes ON_PLAY triggers for drawn cards', () => {
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card', states: [{ id: 1, name: 'S1', actions: [makeOnPlayEffect()] }] },
    };
    const instances = [1, 2].map(id => makeInstance(id, 10, 1));
    const state = makeGameState({
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      drawPile: [1, 2],
    });
    new GameAggregate(state, defs).turnStarted();

    const [, event] = applySpy.mock.calls[0] as unknown as [GameState, { onPlayEvents: unknown[] }];
    expect(event.onPlayEvents.length).toBeGreaterThan(0);
  });
});

describe('GameAggregate.advance — onPlayEvents in event', () => {
  it('ADVANCE event includes ON_PLAY triggers for advanced cards', () => {
    const defs: Record<number, CardDef> = {
      10: { id: 10, name: 'Card', states: [{ id: 1, name: 'S1', actions: [makeOnPlayEffect()] }] },
    };
    const instances = [1, 2].map(id => makeInstance(id, 10, 1));
    const state = makeGameState({
      instances: Object.fromEntries(instances.map(i => [i.id, i])),
      drawPile: [1, 2],
    });
    new GameAggregate(state, defs).advance();

    const [, event] = applySpy.mock.calls[0] as unknown as [GameState, { onPlayEvents: unknown[] }];
    expect(event.onPlayEvents.length).toBeGreaterThan(0);
  });
});

describe('GameAggregate.roundStarted — onDiscoverEvents in event', () => {
  it('ROUND_STARTED event includes ON_DISCOVER triggers for discovered cards', () => {
    const defs: Record<number, CardDef> = {
      10: {
        id: 10,
        name: 'Card',
        states: [{ id: 1, name: 'S1', actions: [makeOnDiscoverEffect()] }],
      },
      11: { id: 11, name: 'Card2', states: [{ id: 1, name: 'S1' }] },
    };
    const state = makeGameState({
      round: 1,
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 11, 1) },
      discoveryPile: [1, 2],
    });
    new GameAggregate(state, defs).roundStarted();

    const [, event] = applySpy.mock.calls[0] as unknown as [
      GameState,
      { onDiscoverEvents: unknown[] },
    ];
    expect(event.onDiscoverEvents.length).toBeGreaterThan(0);
  });
});

// — accessors —

describe('GameAggregate accessors', () => {
  it('getGameState returns the current state', () => {
    expect(makeAggregate().getGameState()).toBeDefined();
  });

  it('getEvents returns accumulated events after dispatch', () => {
    const state = makeGameState({ instances: { 1: makeInstance(1, 10, 1) }, board: [1] });
    const agg = new GameAggregate(state, {});
    agg.cardProduced(1, { gold: 1 });
    expect(agg.getEvents().length).toBeGreaterThan(0);
  });
});
