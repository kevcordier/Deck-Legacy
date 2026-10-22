import { moveOrderedCard } from '@components/PendingChoiceModal/moveOrderedCard';
import { describe, expect, it } from 'vitest';

describe('moveOrderedCard', () => {
  const start = { order: [1, 2, 3], destroyed: null };

  it('moves a card to another slot', () => {
    expect(moveOrderedCard(start, 3, 0)).toEqual({ order: [3, 1, 2], destroyed: null });
    expect(moveOrderedCard(start, 1, 9)).toEqual({ order: [2, 3, 1], destroyed: null });
  });

  it('drops one card on the destroy slot, the previous one going back to the order', () => {
    const destroyed = moveOrderedCard(start, 2, 'destroy');
    expect(destroyed).toEqual({ order: [1, 3], destroyed: 2 });
    expect(moveOrderedCard(destroyed, 1, 'destroy')).toEqual({ order: [3, 2], destroyed: 1 });
  });

  it('takes a card back from the destroy slot', () => {
    const destroyed = moveOrderedCard(start, 2, 'destroy');
    expect(moveOrderedCard(destroyed, 2, 0)).toEqual({ order: [2, 1, 3], destroyed: null });
  });
});
