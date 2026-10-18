import { SyncGameRequestDto } from '../src/games/presentation/dto/sync-game-request.dto';
import { UpdateProfileRequestDto } from '../src/users/presentation/dto/update-profile-request.dto';
import { describe, expect, it } from 'vitest';

const syncSchema = SyncGameRequestDto.schema;

describe('SyncGameRequestDto', () => {
  it('accepts an event log and defaults card names', () => {
    const parsed = syncSchema.parse({ events: [{ id: 'e1', type: 'advance' }] });

    expect(parsed.events).toHaveLength(1);
    expect(parsed.cardNames).toEqual({});
    expect(parsed.name).toBe('');
  });

  it('trims and bounds the kingdom name', () => {
    expect(syncSchema.parse({ events: [], name: '  Avalon ' }).name).toBe('Avalon');
    expect(syncSchema.safeParse({ events: [], name: 'x'.repeat(41) }).success).toBe(false);
  });

  it('rejects non-object events', () => {
    expect(syncSchema.safeParse({ events: ['nope'] }).success).toBe(false);
  });

  it('rejects overly long card names', () => {
    const result = syncSchema.safeParse({ events: [], cardNames: { 1: 'x'.repeat(61) } });

    expect(result.success).toBe(false);
  });
});

describe('UpdateProfileRequestDto', () => {
  it('trims and bounds display names', () => {
    const schema = UpdateProfileRequestDto.schema;
    expect(schema.parse({ displayName: '  Ally ' }).displayName).toBe('Ally');
    expect(schema.safeParse({ displayName: 'A' }).success).toBe(false);
  });
});
