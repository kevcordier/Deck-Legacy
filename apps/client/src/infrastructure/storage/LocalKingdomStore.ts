import { parseJson } from './parseJson';
import { parseKingdomIndex } from './parseKingdomIndex';
import { parseSave } from './parseSave';
import { saveKey } from './saveKey';
import type { KeyValueStorage } from './storage';
import { STORAGE_KEYS } from './storageKeys';
import type { KingdomRepository } from '@application/ports/KingdomRepository';
import type { GameEvent } from '@deck-legacy/engine/domain/types';
import type { KingdomMeta } from '@domain/kingdom/KingdomMeta';
import type { KingdomSummary } from '@domain/kingdom/KingdomSummary';
import type { SaveData } from '@domain/kingdom/SaveData';
import type { SyncInfo } from '@domain/kingdom/SyncInfo';
import { commonPrefix } from '@domain/kingdom/commonPrefix';
import { EMPTY_SUMMARY } from '@domain/kingdom/emptySummary';

/**
 * Local kingdoms: the source of truth for the games played on this device.
 *
 * A kingdom is one save of the player (EDR-038). The index (`deck_legacy_kingdoms`) lists the
 * kingdoms with their name and a score summary for the home page; each save
 * (`deck_legacy_save_<id>`) holds the event log (the engine replays it to rebuild the state),
 * the custom card names, the sync status with the server and the checkpoint the server sent, if
 * any (the game resumes from it, EDR-053).
 */
export class LocalKingdomStore implements KingdomRepository {
  private readonly listeners = new Set<() => void>();
  private snapshot: { content: string | null; kingdoms: KingdomMeta[] } | null = null;
  private readonly parsedSaves = new Map<string, { raw: string | null; save: SaveData | null }>();

  constructor(private readonly storage: KeyValueStorage) {}

  // ─── Kingdom index ─────────────────────────────────────────────────────────

  /** Subscribes to changes of the kingdom index (for `useSyncExternalStore`). */
  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Kingdoms of this device, most recently created first (stable reference between changes). */
  readonly list = (): KingdomMeta[] => {
    const content = this.storage.getItem(STORAGE_KEYS.kingdoms);
    if (this.snapshot?.content !== content) {
      const kingdoms = parseKingdomIndex(content).sort((a, b) => b.createdAt - a.createdAt);
      this.snapshot = { content, kingdoms };
    }
    return this.snapshot.kingdoms;
  };

  get(id: string): KingdomMeta | null {
    return this.list().find(kingdom => kingdom.id === id) ?? null;
  }

  /** Adds (or updates) a kingdom in the index. */
  upsert(kingdom: KingdomMeta): void {
    const others = this.readIndex().filter(k => k.id !== kingdom.id);
    this.writeIndex([...others, kingdom]);
  }

  /** Creates an empty kingdom; its save is written once the game starts. */
  create(id: string, name: string): KingdomMeta {
    const kingdom: KingdomMeta = { id, name, createdAt: Date.now(), summary: EMPTY_SUMMARY };
    this.upsert(kingdom);
    return kingdom;
  }

  /** Renames a kingdom; a started one is marked dirty so the new name reaches the server. */
  rename(id: string, name: string): void {
    const kingdom = this.get(id);
    if (!kingdom) return;
    this.upsert({ ...kingdom, name });
    const save = this.loadSave(id);
    // A later `savedAt` also tells a push in flight that the save changed meanwhile.
    if (save) {
      this.writeSave({
        ...save,
        savedAt: Math.max(Date.now(), save.savedAt + 1),
        sync: { ...save.sync, dirty: true },
      });
    }
  }

  /** Removes a kingdom and its save from this device. */
  delete(id: string): void {
    this.storage.removeItem(saveKey(id));
    this.writeIndex(this.readIndex().filter(k => k.id !== id));
  }

  /** Loads the saves of the indexed kingdoms into the storage cache (startup). */
  hydrateSaves(): Promise<void> {
    return this.storage.hydrateKeys(this.readIndex().map(k => saveKey(k.id)));
  }

  /**
   * Turns the single save of older versions into a kingdom, so no player loses their game.
   * Returns the migrated save, if any.
   */
  migrateLegacySave(name: string): SaveData | null {
    const save = parseSave(parseJson(this.storage.getItem(STORAGE_KEYS.legacySave)));
    this.storage.removeItem(STORAGE_KEYS.legacySave);
    if (!save) return null;
    this.writeSave(save);
    if (!this.get(save.id)) {
      this.upsert({ id: save.id, name, createdAt: save.savedAt, summary: EMPTY_SUMMARY });
    }
    return save;
  }

  // ─── Saves ─────────────────────────────────────────────────────────────────

  /** A kingdom's save, parsed once per stored version (read-only: write with `writeSave`). */
  loadSave(id: string): SaveData | null {
    const raw = this.storage.getItem(saveKey(id));
    const cached = this.parsedSaves.get(id);
    if (cached?.raw === raw) return cached.save;
    const save = parseSave(parseJson(raw));
    this.parsedSaves.set(id, { raw, save });
    return save;
  }

  writeSave(save: SaveData): void {
    this.storage.setItem(saveKey(save.id), JSON.stringify(save));
  }

  /** Saves the game after a change; it will be pushed to the server at the next sync. */
  saveGame(
    id: string,
    events: GameEvent[],
    cardNames: Record<string, string>,
    summary: KingdomSummary,
  ): void {
    const previous = this.loadSave(id);
    // A rewind followed by a new move changes events the server already has.
    const kept = previous ? commonPrefix(previous.events, events) : 0;
    const syncedUpTo = previous ? Math.min(previous.sync.syncedUpTo ?? 0, kept) : 0;
    // A checkpoint only holds while the events it covers are unchanged.
    const checkpoint =
      previous?.checkpoint && previous.checkpoint.seq <= kept ? previous.checkpoint : undefined;
    this.writeSave({
      id,
      events,
      cardNames,
      savedAt: Date.now(),
      sync: {
        dirty: true,
        userId: previous?.sync.userId,
        serverVersion: previous?.sync.serverVersion,
        ...(syncedUpTo > 0 ? { syncedUpTo } : {}),
        ...(previous?.sync.conflict ? { conflict: true } : {}),
      },
      ...(checkpoint ? { checkpoint } : {}),
    });
    const kingdom = this.get(id);
    if (kingdom) this.upsert({ ...kingdom, summary });
  }

  /** Records a sync accepted by (or refused by) the server, unless the save changed meanwhile. */
  updateSyncInfo(id: string, savedAt: number, sync: SyncInfo): void {
    const current = this.loadSave(id);
    if (current?.savedAt !== savedAt) return;
    this.writeSave({ ...current, sync });
  }

  /**
   * Records a sync accepted by the server. The server version is kept even when the player kept
   * playing meanwhile, so the next push builds on it; the save then stays dirty.
   */
  recordAcceptedSync(
    id: string,
    pushed: Pick<SaveData, 'events' | 'savedAt'>,
    userId: string,
    serverVersion: number,
  ): void {
    const current = this.loadSave(id);
    if (!current) return;
    const syncedUpTo = commonPrefix(pushed.events, current.events);
    const changed = current.savedAt !== pushed.savedAt || syncedUpTo < current.events.length;
    this.writeSave({ ...current, sync: { dirty: changed, userId, serverVersion, syncedUpTo } });
  }

  // ─── Games abandoned while offline ─────────────────────────────────────────

  /** Server games to abandon at the next sync (kingdoms deleted while offline). */
  getPendingAbandons(): string[] {
    const ids = parseJson(this.storage.getItem(STORAGE_KEYS.pendingAbandons));
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
  }

  setPendingAbandons(ids: string[]): void {
    if (ids.length === 0) this.storage.removeItem(STORAGE_KEYS.pendingAbandons);
    else this.storage.setItem(STORAGE_KEYS.pendingAbandons, JSON.stringify(ids));
  }

  /** Deletes a kingdom on this device and abandons it on the server (now or at the next sync). */
  abandon(id: string): void {
    this.setPendingAbandons([...new Set([...this.getPendingAbandons(), id])]);
    this.delete(id);
  }

  private readIndex(): KingdomMeta[] {
    return parseKingdomIndex(this.storage.getItem(STORAGE_KEYS.kingdoms));
  }

  private writeIndex(kingdoms: KingdomMeta[]): void {
    this.storage.setItem(STORAGE_KEYS.kingdoms, JSON.stringify(kingdoms));
    for (const listener of this.listeners) listener();
  }
}
