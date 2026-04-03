import { describe, it, expect } from 'vitest';
import { mergeResources, getResMeta } from '@engine/application/resourceHelpers';

// — getResMeta —

describe('getResMeta', () => {
  it('returns known meta for gold', () => {
    const meta = getResMeta('gold');
    expect(meta.cls).toBe('res-gold');
    expect(meta.label).toBe('resources.gold');
  });

  it('returns fallback meta for an unknown key', () => {
    const meta = getResMeta('unknown_resource');
    expect(meta.cls).toBe('res-default');
    expect(meta.label).toBe('unknown_resource');
  });
});

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
    const b = { iron: 4, weapon: 5, goods: 6 };
    expect(mergeResources(a, b)).toEqual({
      gold: 1,
      wood: 2,
      stone: 3,
      iron: 4,
      weapon: 5,
      goods: 6,
    });
  });
});
