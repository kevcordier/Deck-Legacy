/**
 * @file services/storage.ts
 * Synchronous key/value storage backed by AsyncStorage (preferences and the local save).
 *
 * AsyncStorage is asynchronous (and uses `localStorage` on web), while the UI reads
 * preferences synchronously during render. All keys are loaded once into an in-memory cache by
 * `hydrateStorage()` before the app renders; reads then hit the cache and writes update the
 * cache immediately and are persisted in the background.
 *
 * Kingdoms (one save each, see `services/persistence.ts`) are saved here and synced to the
 * server in the background. Their save keys are dynamic (`saveKey(id)`): they are loaded by
 * `hydrateKeys()` once the kingdom index is read.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  /** Single save of versions older than the kingdoms; migrated at startup. */
  legacySave: 'deck_legacy_save',
  kingdoms: 'deck_legacy_kingdoms',
  /** The player chose to play without an account. */
  offline: 'deck_legacy_offline',
  pendingAbandons: 'deck_legacy_pending_abandons',
  lang: 'deck_legacy_lang',
  theme: 'deck_legacy_theme',
  tutorial: 'deck_legacy_tutorial',
} as const;

/** Storage key of a kingdom's save. */
export function saveKey(id: string): string {
  return `deck_legacy_save_${id}`;
}

const cache = new Map<string, string>();

/** Loads keys into the cache (dynamic keys such as kingdom saves). */
export async function hydrateKeys(keys: readonly string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    const entries = await AsyncStorage.multiGet(keys);
    for (const [key, value] of entries) {
      if (value !== null) cache.set(key, value);
    }
  } catch (e) {
    console.warn('Unable to read storage', e);
  }
}

export function hydrateStorage(): Promise<void> {
  return hydrateKeys(Object.values(STORAGE_KEYS));
}

export const storage = {
  getItem(key: string): string | null {
    return cache.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    cache.set(key, value);
    AsyncStorage.setItem(key, value).catch((e: unknown) => console.warn('Unable to write', key, e));
  },
  removeItem(key: string): void {
    cache.delete(key);
    AsyncStorage.removeItem(key).catch((e: unknown) => console.warn('Unable to remove', key, e));
  },
};
