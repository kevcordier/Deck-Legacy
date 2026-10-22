import { makeState } from '../fixtures';
import { UnlockStrategy } from '@engine/domain/cardAction/UnlockStrategy';
import { ActionEffectType, ResourceType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('UnlockStrategy', () => {
  const strategy = new UnlockStrategy();

  it('adds the stickers of a foundation to the stock and unlocks its resources', () => {
    const state = makeState({ stickerStock: { 4: 1 }, unlockedResources: [ResourceType.SCIENCE] });
    const result = strategy.apply(state, {
      id: 'x',
      type: ActionEffectType.UNLOCK,
      sourceInstanceId: 1,
      unlock: {
        stickers: { 4: 5, 62: 10 },
        resources: [ResourceType.SCIENCE, ResourceType.HERB],
      },
    });
    expect(result.stickerStock).toEqual({ 4: 6, 62: 10 });
    expect(result.unlockedResources).toEqual([ResourceType.SCIENCE, ResourceType.HERB]);
  });

  it('unlocks no resource when the foundation brings none', () => {
    const result = strategy.apply(makeState(), {
      id: 'x',
      type: ActionEffectType.UNLOCK,
      sourceInstanceId: 1,
      unlock: { stickers: { 10: 5 } },
    });
    expect(result.stickerStock[10]).toBe(5);
    expect(result.unlockedResources).toBeUndefined();
  });
});
