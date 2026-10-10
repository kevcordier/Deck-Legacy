import { makeInstance, makeState } from '../fixtures';
import { ChoseStateStrategy } from '@engine/application/cardAction/ChoseStateStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('ChoseStateStrategy', () => {
  const strategy = new ChoseStateStrategy();

  it('returns state unchanged when instanceId is missing', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.CHOOSE_STATE,
      sourceInstanceId: 1,
      stateId: 2,
    });
    expect(result).toBe(gs);
  });

  it('returns state unchanged when stateId is missing', () => {
    const inst = makeInstance({ id: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.CHOOSE_STATE,
      sourceInstanceId: 1,
      instanceIds: [1],
    });
    expect(result).toBe(gs);
  });

  it('updates the stateId on the target instance', () => {
    const inst = makeInstance({ id: 1, stateId: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.CHOOSE_STATE,
      sourceInstanceId: 1,
      instanceIds: [1],
      stateId: 5,
    });
    expect(result.instances[1].stateId).toBe(5);
  });
});
