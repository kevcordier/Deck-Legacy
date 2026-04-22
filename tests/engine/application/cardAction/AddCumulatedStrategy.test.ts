import { makeGameState, makeInstance } from '../testHelpers';
import { AddCumulatedStrategy } from '@engine/application/cardAction/AddCumulatedStrategy';
import { ActionType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('AddCumulatedStrategy', () => {
  const strategy = new AddCumulatedStrategy();

  it('adds accumulated values to an empty cumulated record', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
      accumulated: { glory: 2 },
    });
    expect(result.instances[1].cumulated['glory']).toBe(2);
  });

  it('sums accumulated values with existing ones', () => {
    const instance = makeInstance(1, 10, 1, { cumulated: { glory: 3 } });
    const gs = makeGameState({ instances: { 1: instance } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
      accumulated: { glory: 4 },
    });
    expect(result.instances[1].cumulated['glory']).toBe(7);
  });

  it('adds multiple keys at once', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
      accumulated: { glory: 1, gold: 5 },
    });
    expect(result.instances[1].cumulated['glory']).toBe(1);
    expect(result.instances[1].cumulated['gold']).toBe(5);
  });

  it('returns unchanged state when instanceIds is undefined', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_CUMULATED,
      sourceInstanceId: 1,
      accumulated: { glory: 1 },
    });
    expect(result).toBe(gs);
  });

  it('returns unchanged state when accumulated is undefined', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
    });
    expect(result).toBe(gs);
  });

  it('does not mutate the original game state', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.ADD_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
      accumulated: { glory: 2 },
    });
    expect(gs.instances[1].cumulated['glory']).toBeUndefined();
  });
});
