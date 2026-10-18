import type { KeyValueStorage } from '@infrastructure/storage/storage';

/** In-memory replacement for the app storage in tests. */
export const memory = new Map<string, string>();

export const memoryStorage: KeyValueStorage = {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memory.set(key, value);
  },
  removeItem: (key: string) => {
    memory.delete(key);
  },
  hydrateKeys: async () => undefined,
};
