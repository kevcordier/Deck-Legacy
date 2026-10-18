/** Sync state of a local save with the server. */
export type SyncInfo = {
  /** True when the local save has changes the server has not accepted yet. */
  dirty: boolean;
  /** Account the save was last synced with. */
  userId?: string;
  /** Server version after the last accepted sync. */
  serverVersion?: number;
  /** The server refused this save (it cannot be replayed); retried after the next change. */
  rejected?: boolean;
  /** The server refused a new kingdom (kingdom limit reached); retried after the next change. */
  limited?: boolean;
  /** Number of leading events the server already has: only the events after them are pushed. */
  syncedUpTo?: number;
  /** Another device synced this kingdom meanwhile: the player chooses which version to keep. */
  conflict?: boolean;
};
