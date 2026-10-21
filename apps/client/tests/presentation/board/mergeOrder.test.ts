import { mergeOrder } from '@presentation/board/mergeOrder';
import { describe, expect, it } from 'vitest';

describe('mergeOrder', () => {
  it('keeps the shown order, drops cards that left and puts new cards first', () => {
    expect(mergeOrder([3, 1, 2], [1, 2, 4])).toEqual([4, 1, 2]);
    expect(mergeOrder([3, 1, 2], [2, 3, 1, 5, 6])).toEqual([5, 6, 3, 1, 2]);
  });

  it('uses the engine order when nothing was shown yet', () => {
    expect(mergeOrder([], [5, 2])).toEqual([5, 2]);
  });
});
