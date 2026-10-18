import { maxKingdoms } from '@domain/kingdom/maxKingdoms';
import { describe, expect, it } from 'vitest';

describe('maxKingdoms', () => {
  it('allows ten kingdoms with an account and one otherwise', () => {
    expect(maxKingdoms({ isAnonymous: false })).toBe(10);
    expect(maxKingdoms({ isAnonymous: true })).toBe(1);
    expect(maxKingdoms(null)).toBe(1);
  });
});
