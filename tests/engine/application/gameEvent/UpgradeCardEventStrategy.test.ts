import { makeGameState, makeInstance } from '../testHelpers';
import { UpgradeCardEventStrategy } from '@engine/application/gameEvent/UpgradeCardEventStrategy';
import { GameEventType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

const makeEvent = (
  overrides: Partial<{
    cardInstanceId: number;
    stateId: number;
    cost: Record<string, number>;
  }> = {},
) => ({
  id: 'evt-1',
  type: GameEventType.UPGRADE_CARD,
  timestamp: 0,
  cardInstanceId: 1,
  stateId: 2,
  cost: {},
  ...overrides,
});

describe('UpgradeCardEventStrategy', () => {
  const strategy = new UpgradeCardEventStrategy();

  it('updates the stateId of the target instance', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    });
    const result = strategy.apply(gs, makeEvent({ cardInstanceId: 1, stateId: 99 }));
    expect(result.instances[1].stateId).toBe(99);
  });

  it('does not alter other instance state IDs', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1), 2: makeInstance(2, 11, 5) },
      board: [1, 2],
    });
    const result = strategy.apply(gs, makeEvent({ cardInstanceId: 1, stateId: 99 }));
    expect(result.instances[2].stateId).toBe(5);
  });

  it('moves the upgraded card to discardPile', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
    });
    const result = strategy.apply(gs, makeEvent({ cardInstanceId: 1 }));
    expect(result.board).not.toContain(1);
    expect(result.discardPile).toContain(1);
  });

  it('spends the cost resources', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      resources: { gold: 5, wood: 2 },
    });
    const result = strategy.apply(gs, makeEvent({ cost: { gold: 3 } }));
    expect(result.resources).toEqual({ gold: 2, wood: 2 });
  });

  it('removes resource key when cost exhausts it', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      resources: { gold: 2 },
    });
    const result = strategy.apply(gs, makeEvent({ cost: { gold: 2 } }));
    expect(result.resources.gold).toBeUndefined();
  });

  it('handles zero cost upgrade', () => {
    const gs = makeGameState({
      instances: { 1: makeInstance(1, 10, 1) },
      board: [1],
      resources: { gold: 3 },
    });
    const result = strategy.apply(gs, makeEvent({ cost: {} }));
    expect(result.resources).toEqual({ gold: 3 });
  });
});
