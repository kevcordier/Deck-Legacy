import { storage } from './storage';
import { STORAGE_KEYS } from './storageKeys';
import type { PreferenceKey, Preferences } from '@application/ports/Preferences';

/** Player preferences kept in the app storage (`STORAGE_KEYS`). */
export const storagePreferences: Preferences = {
  get: (key: PreferenceKey) => storage.getItem(STORAGE_KEYS[key]),
  set: (key: PreferenceKey, value: string) => storage.setItem(STORAGE_KEYS[key], value),
};
