import {
  MAX_KINGDOMS_PER_ACCOUNT,
  MAX_KINGDOMS_PER_GUEST,
  kingdomLimit,
} from '@engine/domain/kingdomLimits';
import { describe, expect, it } from 'vitest';

describe('kingdomLimit', () => {
  it('allows one kingdom to guests and ten to registered accounts', () => {
    expect(kingdomLimit(true)).toBe(MAX_KINGDOMS_PER_GUEST);
    expect(MAX_KINGDOMS_PER_GUEST).toBe(1);
    expect(MAX_KINGDOMS_PER_ACCOUNT).toBe(10);
    expect(kingdomLimit(false)).toBe(MAX_KINGDOMS_PER_ACCOUNT);
  });
});
