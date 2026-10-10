import { kingdomLimit, syncGameRequestSchema, updateProfileRequestSchema } from '../src';
import { describe, expect, it } from 'vitest';

describe('syncGameRequestSchema', () => {
  it('accepts an event log and defaults card names', () => {
    const parsed = syncGameRequestSchema.parse({ events: [{ id: 'e1', type: 'advance' }] });

    expect(parsed.events).toHaveLength(1);
    expect(parsed.cardNames).toEqual({});
    expect(parsed.name).toBe('');
  });

  it('trims and bounds the kingdom name', () => {
    expect(syncGameRequestSchema.parse({ events: [], name: '  Avalon ' }).name).toBe('Avalon');
    expect(syncGameRequestSchema.safeParse({ events: [], name: 'x'.repeat(41) }).success).toBe(
      false,
    );
  });

  it('rejects non-object events', () => {
    expect(syncGameRequestSchema.safeParse({ events: ['nope'] }).success).toBe(false);
  });

  it('rejects overly long card names', () => {
    const result = syncGameRequestSchema.safeParse({
      events: [],
      cardNames: { 1: 'x'.repeat(61) },
    });

    expect(result.success).toBe(false);
  });
});

describe('updateProfileRequestSchema', () => {
  it('trims and bounds display names', () => {
    expect(updateProfileRequestSchema.parse({ displayName: '  Ally ' }).displayName).toBe('Ally');
    expect(updateProfileRequestSchema.safeParse({ displayName: 'A' }).success).toBe(false);
  });
});

describe('kingdomLimit', () => {
  it('allows one kingdom to guests and ten to registered accounts', () => {
    expect(kingdomLimit(true)).toBe(1);
    expect(kingdomLimit(false)).toBe(10);
  });
});
