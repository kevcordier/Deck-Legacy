import { makeGameState, makeInstance } from '../testHelpers';
import { SetCumulatedStrategy } from '@engine/application/cardAction/SetCumulatedStrategy';
import { ActionType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('SetCumulatedStrategy', () => {
  const strategy = new SetCumulatedStrategy();

  it('sets accumulated values on an empty cumulated record', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.SET_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
      accumulated: { glory: 5 },
    });
    expect(result.instances[1].cumulated['glory']).toBe(5);
  });

  it('overwrites existing cumulated values', () => {
    const instance = makeInstance(1, 10, 1, { cumulated: { glory: 10 } });
    const gs = makeGameState({ instances: { 1: instance } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.SET_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
      accumulated: { glory: 3 },
    });
    expect(result.instances[1].cumulated['glory']).toBe(3);
  });

  it('preserves other keys when setting one key', () => {
    const instance = makeInstance(1, 10, 1, { cumulated: { glory: 2, gold: 7 } });
    const gs = makeGameState({ instances: { 1: instance } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.SET_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
      accumulated: { glory: 9 },
    });
    expect(result.instances[1].cumulated['glory']).toBe(9);
    expect(result.instances[1].cumulated['gold']).toBe(7);
  });

  it('returns unchanged state when instanceIds is undefined', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.SET_CUMULATED,
      sourceInstanceId: 1,
      accumulated: { glory: 1 },
    });
    expect(result).toBe(gs);
  });

  it('returns unchanged state when accumulated is undefined', () => {
    const gs = makeGameState({ instances: { 1: makeInstance(1, 10, 1) } });
    const result = strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.SET_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
    });
    expect(result).toBe(gs);
  });

  it('does not mutate the original game state', () => {
    const instance = makeInstance(1, 10, 1, { cumulated: { glory: 1 } });
    const gs = makeGameState({ instances: { 1: instance } });
    strategy.applyEffect(gs, {
      id: '1-1',
      type: ActionType.SET_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
      accumulated: { glory: 99 },
    });
    expect(gs.instances[1].cumulated['glory']).toBe(1);
  });
});
