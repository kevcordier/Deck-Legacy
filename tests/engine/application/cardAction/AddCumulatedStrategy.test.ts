import { makeInstance, makeState } from '../fixtures';
import { AddCumulatedStrategy } from '@engine/application/cardAction/AddCumulatedStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('AddCumulatedStrategy', () => {
  const strategy = new AddCumulatedStrategy();

  it('returns state unchanged when instanceIds missing', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_CUMULATED,
      sourceInstanceId: 1,
      accumulated: 1,
    });
    expect(result).toBe(gs);
  });

  it('returns state unchanged when accumulated missing', () => {
    const inst = makeInstance({ id: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
    });
    expect(result).toBe(gs);
  });

  it('adds to existing cumulated value', () => {
    const inst = makeInstance({ id: 1, cumulated: 2 });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
      accumulated: 3,
    });
    expect(result.instances[1].cumulated).toBe(5);
  });

  it('initializes key from zero when not present', () => {
    const inst = makeInstance({ id: 1, cumulated: 0 });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
      accumulated: 4,
    });
    expect(result.instances[1].cumulated).toBe(4);
  });
});
