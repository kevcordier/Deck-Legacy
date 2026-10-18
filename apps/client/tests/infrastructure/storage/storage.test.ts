import { storage } from '@infrastructure/storage/storage';
import { describe, expect, it, vi } from 'vitest';

const toastError = vi.hoisted(() => vi.fn());
vi.mock('@infrastructure/toast/toast', () => ({ toast: { error: toastError } }));
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { setItem: () => Promise.reject(new Error('QuotaExceededError')) },
}));

describe('storage', () => {
  it('tells the player when a write fails, keeping the value in memory', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    storage.setItem('deck_legacy_save_g1', '{}');
    await vi.waitFor(() => expect(toastError).toHaveBeenCalledOnce());

    expect(storage.getItem('deck_legacy_save_g1')).toBe('{}');
  });
});
