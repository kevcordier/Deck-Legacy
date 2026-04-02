import { describe, it, expect } from 'vitest';
import { mergeResources, spendResources } from '@engine/application/resourceHelpers';

describe('mergeResources', () => {
  it('returns empty object when both inputs are empty', () => {
    expect(mergeResources({}, {})).toEqual({});
  });

  it('copies values from a when b is empty', () => {
    expect(mergeResources({ gold: 3, wood: 2 }, {})).toEqual({ gold: 3, wood: 2 });
  });

  it('copies values from b when a is empty', () => {
    expect(mergeResources({}, { gold: 5 })).toEqual({ gold: 5 });
  });

  it('additively merges overlapping keys', () => {
    expect(mergeResources({ gold: 3, wood: 1 }, { gold: 2, stone: 4 })).toEqual({
      gold: 5,
      wood: 1,
      stone: 4,
    });
  });

  it('does not mutate the first argument', () => {
    const a = { gold: 1 };
    mergeResources(a, { gold: 2 });
    expect(a.gold).toBe(1);
  });

  it('does not mutate the second argument', () => {
    const b = { gold: 2 };
    mergeResources({ gold: 1 }, b);
    expect(b.gold).toBe(2);
  });

  it('merges all resource types', () => {
    const a = { gold: 1, wood: 2, stone: 3 };
    const b = { iron: 4, sword: 5, goods: 6 };
    expect(mergeResources(a, b)).toEqual({
      gold: 1,
      wood: 2,
      stone: 3,
      iron: 4,
      sword: 5,
      goods: 6,
    });
  });
});

describe('spendResources', () => {
  it('returns empty object when both inputs are empty', () => {
    expect(spendResources({}, {})).toEqual({});
  });

  it('subtracts values from matching keys', () => {
    expect(spendResources({ gold: 5, wood: 3 }, { gold: 2, wood: 1 })).toEqual({
      gold: 3,
      wood: 2,
    });
  });

  it('removes keys that reach exactly zero', () => {
    expect(spendResources({ gold: 3 }, { gold: 3 })).toEqual({});
  });

  it('removes keys that go below zero', () => {
    const result = spendResources({ gold: 2 }, { gold: 5 });
    expect(result.gold).toBeUndefined();
  });

  it('does not mutate the first argument', () => {
    const a = { gold: 5 };
    spendResources(a, { gold: 2 });
    expect(a.gold).toBe(5);
  });

  it('leaves keys in a that are not in b', () => {
    expect(spendResources({ gold: 5, wood: 3 }, { gold: 2 })).toEqual({ gold: 3, wood: 3 });
  });

  it('ignores keys in b that are not in a', () => {
    const result = spendResources({ gold: 5 }, { wood: 2 });
    expect(result.gold).toBe(5);
    expect(result.wood).toBeUndefined();
  });
});
