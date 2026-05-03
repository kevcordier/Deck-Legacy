import { makeState } from '../fixtures';
import { ShuffleDeckStrategy } from '@engine/application/cardAction/ShuffleDeckStrategy';
import { ActionEffectType } from '@engine/domain/enums';
import { describe, expect, it } from 'vitest';

describe('ShuffleDeckStrategy', () => {
  it('shuffles draw pile by default', () => {
    const strategy = new ShuffleDeckStrategy();
    const gs = makeState({ drawPile: [1, 2, 3, 4] });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.SHUFFLE_DECK,
      sourceInstanceId: 1,
    });

    expect(result.drawPile).toHaveLength(4);
    expect([...result.drawPile].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
  });

  it('shuffles discard pile when deck is discard', () => {
    const strategy = new ShuffleDeckStrategy();
    const gs = makeState({ discardPile: [10, 20, 30, 40] });

    const result = strategy.apply(gs, {
      id: 'x',
      type: ActionEffectType.SHUFFLE_DECK,
      sourceInstanceId: 1,
      deck: 'discard',
    });

    expect(result.discardPile).toHaveLength(4);
    expect([...result.discardPile].sort((a, b) => a - b)).toEqual([10, 20, 30, 40]);
  });
});
