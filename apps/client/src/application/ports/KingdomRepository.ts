import type { GameEvent } from '@deck-legacy/engine/domain/types';
import type { KingdomMeta } from '@domain/kingdom/KingdomMeta';
import type { KingdomSummary } from '@domain/kingdom/KingdomSummary';
import type { SaveData } from '@domain/kingdom/SaveData';
import type { SyncInfo } from '@domain/kingdom/SyncInfo';

/** The kingdoms and saves of this device. */
export interface KingdomRepository {
  /** Subscribes to changes of the kingdom index (for `useSyncExternalStore`). */
  subscribe(listener: () => void): () => void;
  list(): KingdomMeta[];
  get(id: string): KingdomMeta | null;
  upsert(kingdom: KingdomMeta): void;
  delete(id: string): void;
  create(id: string, name: string): KingdomMeta;
  rename(id: string, name: string): void;
  /** Deletes a kingdom on this device and abandons it on the server at the next sync. */
  abandon(id: string): void;
  saveGame(
    id: string,
    events: GameEvent[],
    cardNames: Record<string, string>,
    summary: KingdomSummary,
  ): void;
  /** Turns the single save of older versions into a kingdom; returns it, if any. */
  migrateLegacySave(name: string): SaveData | null;
  loadSave(id: string): SaveData | null;
  writeSave(save: SaveData): void;
  updateSyncInfo(id: string, savedAt: number, sync: SyncInfo): void;
  recordAcceptedSync(
    id: string,
    pushed: Pick<SaveData, 'events' | 'savedAt'>,
    userId: string,
    serverVersion: number,
  ): void;
  getPendingAbandons(): string[];
  setPendingAbandons(ids: string[]): void;
}
