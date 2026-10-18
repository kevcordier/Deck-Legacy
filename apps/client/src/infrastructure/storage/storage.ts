/**
 * Synchronous key/value storage backed by AsyncStorage (preferences and the local saves).
 *
 * AsyncStorage is asynchronous (and uses `localStorage` on web), while the UI reads
 * preferences synchronously during render. All keys are loaded once into an in-memory cache by
 * `storage.hydrate()` before the app renders; reads then hit the cache and writes update the
 * cache immediately and are persisted in the background.
 *
 * Kingdom saves have dynamic keys (`saveKey(id)`): they are loaded by `storage.hydrateKeys()`
 * once the kingdom index is read.
 */
import { STORAGE_KEYS } from './storageKeys';
import { toast } from '@infrastructure/toast/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';

const cache = new Map<string, string>();

export const storage = {
  getItem(key: string): string | null {
    return cache.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    cache.set(key, value);
    AsyncStorage.setItem(key, value).catch((e: unknown) => {
      // Usually the storage is full: the change only lives in memory and is lost on reload.
      console.warn('Unable to write', key, e);
      toast.error(i18n.t('errors.storageWrite'));
    });
  },
  removeItem(key: string): void {
    cache.delete(key);
    AsyncStorage.removeItem(key).catch((e: unknown) => console.warn('Unable to remove', key, e));
  },
  /** Loads keys into the cache (dynamic keys such as kingdom saves). */
  async hydrateKeys(keys: readonly string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      const entries = await AsyncStorage.multiGet(keys);
      for (const [key, value] of entries) {
        if (value !== null) cache.set(key, value);
      }
    } catch (e) {
      console.warn('Unable to read storage', e);
    }
  },
  /** Loads the fixed keys (`STORAGE_KEYS`) before the first render. */
  hydrate(): Promise<void> {
    return storage.hydrateKeys(Object.values(STORAGE_KEYS));
  },
};

/** What the kingdom store needs from the storage (an in-memory map in tests). */
export type KeyValueStorage = Pick<
  typeof storage,
  'getItem' | 'setItem' | 'removeItem' | 'hydrateKeys'
>;
