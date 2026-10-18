import { memory, memoryStorage } from '../../memoryStorage';
import { storagePreferences } from '@infrastructure/storage/storagePreferences';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@infrastructure/storage/storage', () => ({ storage: memoryStorage }));

describe('storagePreferences', () => {
  it('keeps each preference under its storage key', () => {
    storagePreferences.set('tutorial', 'false');

    expect(memory.get('deck_legacy_tutorial')).toBe('false');
    expect(storagePreferences.get('tutorial')).toBe('false');
    expect(storagePreferences.get('offline')).toBeNull();
  });
});
