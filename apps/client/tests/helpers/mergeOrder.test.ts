import { mergeOrder } from '@helpers/mergeOrder';
import { describe, expect, it } from 'vitest';

describe('mergeOrder', () => {
  it('keeps the chosen order, drops cards that left and appends new cards', () => {
    expect(mergeOrder([3, 1, 2], [1, 2, 4])).toEqual([1, 2, 4]);
    expect(mergeOrder([3, 1, 2], [2, 3, 1, 5])).toEqual([3, 1, 2, 5]);
  });

  it('uses the given order when nothing was dragged yet', () => {
    expect(mergeOrder([], [5, 2])).toEqual([5, 2]);
  });
});
