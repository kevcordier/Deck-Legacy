/** In-memory replacement for `@services/storage` in tests. */
export const memory = new Map<string, string>();

export const storageMock = {
  STORAGE_KEYS: {
    legacySave: 'deck_legacy_save',
    kingdoms: 'deck_legacy_kingdoms',
    offline: 'deck_legacy_offline',
    pendingAbandons: 'deck_legacy_pending_abandons',
  },
  saveKey: (id: string) => `deck_legacy_save_${id}`,
  hydrateKeys: async () => undefined,
  storage: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  },
};
