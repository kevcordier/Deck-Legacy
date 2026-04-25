import { makeState } from '../fixtures';
import { AddResourceStrategy } from '@engine/application/cardAction/AddResourceStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('AddResourceStrategy', () => {
  const strategy = new AddResourceStrategy();

  it('merges resources into game state', () => {
    const gs = makeState({ resources: { gold: 1 } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: { gold: 2, wood: 3 },
    });
    expect(result.resources).toEqual({ gold: 3, wood: 3 });
  });

  it('handles empty resources payload', () => {
    const gs = makeState({ resources: { gold: 1 } });
    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.ADD_RESOURCES,
      sourceInstanceId: 1,
      resources: {},
    });
    expect(result.resources).toEqual({ gold: 1 });
  });
});
