import { makeEmptyResolvedCost, makeGameState, makeInstance } from '../testHelpers';
import { UseCardEffectStrategy } from '@engine/application/gameEvent/UseCardEffectStrategy';
import { ActionType, GameEventType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

const makeTriggerEntry = () => ({
  effectDef: { id: 'action-1', actionEffects: [{ id: 1, type: ActionType.ADD_RESOURCES }] },
  sourceInstanceId: 1,
});

const makeEvent = (
  overrides: Partial<{
    actionId: string;
    gameStateChanges: object;
    resolvedCost: ReturnType<typeof makeEmptyResolvedCost>;
    triggerId: string;
    sourceInstanceId: number;
    isDiscarded: boolean;
    isDestroyed: boolean;
  }> = {},
) => ({
  id: 'evt-1',
  type: GameEventType.USE_CARD_EFFECT,
  timestamp: 0,
  actionId: 'action-1',
  gameStateChanges: {},
  resolvedCost: makeEmptyResolvedCost(),
  triggerId: 'trigger-uuid',
  sourceInstanceId: 1,
  ...overrides,
});

describe('UseCardEffectStrategy', () => {
  const strategy = new UseCardEffectStrategy();

  it('removes the triggerId from triggerPile', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      triggerPile: { 'trigger-uuid': makeTriggerEntry(), 'other-uuid': makeTriggerEntry() },
    });
    const result = strategy.apply(gs, makeEvent({ triggerId: 'trigger-uuid' }));
    expect(result.triggerPile['trigger-uuid']).toBeUndefined();
    expect(result.triggerPile['other-uuid']).toBeDefined();
  });

  it('applies gameStateChanges to the state', () => {
    const gs = makeGameState({ resources: { gold: 1 } });
    const result = strategy.apply(gs, makeEvent({ gameStateChanges: { resources: { gold: 10 } } }));
    expect(result.resources).toEqual({ gold: 10 });
  });

  it('discards sourceInstanceId when isDiscarded is true', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    });
    const result = strategy.apply(gs, makeEvent({ sourceInstanceId: 1, isDiscarded: true }));
    expect(result.board).not.toContain(1);
    expect(result.discardPile).toContain(1);
  });

  it('destroys sourceInstanceId when isDestroyed is true', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    });
    const result = strategy.apply(gs, makeEvent({ sourceInstanceId: 1, isDestroyed: true }));
    expect(result.board).not.toContain(1);
    expect(result.destroyedPile).toContain(1);
  });

  it('discards cards from resolvedCost.discardedCardIds', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 11, 1) },
      board: [2],
    });
    const resolvedCost = { ...makeEmptyResolvedCost(), discardedCardIds: [2] };
    const result = strategy.apply(gs, makeEvent({ resolvedCost }));
    expect(result.board).not.toContain(2);
    expect(result.discardPile).toContain(2);
  });

  it('destroys cards from resolvedCost.destroyedCardIds', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 11, 1) },
      board: [2],
    });
    const resolvedCost = { ...makeEmptyResolvedCost(), destroyedCardIds: [2] };
    const result = strategy.apply(gs, makeEvent({ resolvedCost }));
    expect(result.destroyedPile).toContain(2);
  });

  it('spends resource cost', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      resources: { gold: 5 },
    });
    const resolvedCost = { ...makeEmptyResolvedCost(), resources: { gold: 3 } };
    const result = strategy.apply(gs, makeEvent({ resolvedCost }));
    expect(result.resources).toEqual({ gold: 2 });
  });

  it('handles resolvedCost with undefined discardedCardIds and destroyedCardIds', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    const resolvedCost = { resources: {} } as ReturnType<typeof makeEmptyResolvedCost>;
    const result = strategy.apply(gs, makeEvent({ resolvedCost }));
    expect(result).toBeDefined();
  });
});
