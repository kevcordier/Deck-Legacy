import type { KingdomMeta } from '@domain/kingdom/KingdomMeta';
import type { SaveData } from '@domain/kingdom/SaveData';
import type { SyncInfo } from '@domain/kingdom/SyncInfo';

/** The kingdoms and saves of this device, as the sync reads and updates them. */
export interface KingdomRepository {
  list(): KingdomMeta[];
  get(id: string): KingdomMeta | null;
  upsert(kingdom: KingdomMeta): void;
  delete(id: string): void;
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
