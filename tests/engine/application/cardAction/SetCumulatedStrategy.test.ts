import { makeInstance, makeState } from '../fixtures';
import { SetCumulatedStrategy } from '@engine/application/cardAction/SetCumulatedStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('SetCumulatedStrategy', () => {
  const strategy = new SetCumulatedStrategy();

  it('returns state unchanged when instanceId missing', () => {
    const gs = makeState();
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.SET_CUMULATED,
      sourceInstanceId: 1,
      accumulated: { glory: 5 },
    });
    expect(result).toBe(gs);
  });

  it('returns state unchanged when accumulated missing', () => {
    const inst = makeInstance({ id: 1 });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.SET_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
    });
    expect(result).toBe(gs);
  });

  it('sets cumulated value, overwriting existing', () => {
    const inst = makeInstance({ id: 1, cumulated: { glory: 10 } });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.SET_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
      accumulated: { glory: 3 },
    });
    expect(result.instances[1].cumulated.glory).toBe(3);
  });

  it('adds new keys without removing existing ones', () => {
    const inst = makeInstance({ id: 1, cumulated: { stars: 2 } });
    const gs = makeState({ instances: { 1: inst } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.SET_CUMULATED,
      sourceInstanceId: 1,
      instanceIds: [1],
      accumulated: { glory: 1 },
    });
    expect(result.instances[1].cumulated.stars).toBe(2);
    expect(result.instances[1].cumulated.glory).toBe(1);
  });
});
