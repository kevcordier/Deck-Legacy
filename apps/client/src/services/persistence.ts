/**
 * Local kingdoms: the source of truth for the games played on this device.
 *
 * A kingdom is one save of the player (EDR-038). The index (`deck_legacy_kingdoms`) lists the
 * kingdoms with their name and a score summary for the home page; each save
 * (`deck_legacy_save_<id>`) holds the event log (the engine replays it to rebuild the state),
 * the custom card names and the sync status with the server. Saves written by older versions
 * have no `sync` field and are treated as not yet synced.
 */
import type { CampaignSegmentScore } from '@deck-legacy/api-contract';
import type { GameEvent } from '@deck-legacy/engine/domain/types';
import { STORAGE_KEYS, hydrateKeys, saveKey, storage } from '@services/storage';

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

export type SaveData = {
  id: string;
  events: GameEvent[];
  cardNames: Record<string, string>;
  savedAt: number;
  sync: SyncInfo;
};

/** Scores shown on the home page; computed on the device, the server's scores stay authoritative. */
export type KingdomSummary = {
  score: number;
  /** Cumulative score at the end of each campaign segment, in the order they were played. */
  segments: CampaignSegmentScore[];
  finished: boolean;
};

export type KingdomMeta = {
  id: string;
  name: string;
  createdAt: number;
  summary: KingdomSummary;
};

export const EMPTY_SUMMARY: KingdomSummary = { score: 0, segments: [], finished: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function toCardNames(value: unknown): Record<string, string> {
  const names: Record<string, string> = {};
  if (!isRecord(value)) return names;
  for (const [key, name] of Object.entries(value)) {
    if (typeof name === 'string') names[key] = name;
  }
  return names;
}

function toSyncInfo(value: unknown): SyncInfo {
  if (!isRecord(value)) return { dirty: true };
  return {
    dirty: value.dirty !== false,
    userId: typeof value.userId === 'string' ? value.userId : undefined,
    serverVersion: typeof value.serverVersion === 'number' ? value.serverVersion : undefined,
    ...(value.rejected === true ? { rejected: true } : {}),
    ...(value.limited === true ? { limited: true } : {}),
    ...(typeof value.syncedUpTo === 'number' ? { syncedUpTo: value.syncedUpTo } : {}),
    ...(value.conflict === true ? { conflict: true } : {}),
  };
}

/** Number of leading events two logs share (compared by id, as the server does). */
export function commonPrefix(a: GameEvent[], b: GameEvent[]): number {
  let index = 0;
  while (index < a.length && index < b.length && a[index].id === b[index].id) index += 1;
  return index;
}

function toSegments(value: unknown): CampaignSegmentScore[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item =>
    isRecord(item) && typeof item.segment === 'string' && typeof item.score === 'number'
      ? [{ segment: item.segment, score: item.score }]
      : [],
  );
}

function toSummary(value: unknown): KingdomSummary {
  if (!isRecord(value)) return EMPTY_SUMMARY;
  return {
    score: typeof value.score === 'number' ? value.score : 0,
    segments: toSegments(value.segments),
    finished: value.finished === true,
  };
}

/** Reads a stored save (current format or the former single-save versions). */
export function parseSave(raw: unknown): SaveData | null {
  if (!isRecord(raw) || typeof raw.id !== 'string' || !Array.isArray(raw.events)) return null;
  return {
    id: raw.id,
    events: raw.events as GameEvent[],
    cardNames: toCardNames(raw.cardNames),
    savedAt: typeof raw.savedAt === 'number' ? raw.savedAt : Date.now(),
    sync: toSyncInfo(raw.sync),
  };
}

// ─── Change notifications ────────────────────────────────────────────────────

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

/** Subscribes to changes of the kingdom index (for `useSyncExternalStore`). */
export function subscribeKingdoms(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── Kingdom index ───────────────────────────────────────────────────────────

function parseIndex(content: string | null): KingdomMeta[] {
  const raw = parseJson(content);
  if (!Array.isArray(raw)) return [];
  return raw.flatMap(item =>
    isRecord(item) && typeof item.id === 'string'
      ? [
          {
            id: item.id,
            name: typeof item.name === 'string' ? item.name : '',
            createdAt: typeof item.createdAt === 'number' ? item.createdAt : 0,
            summary: toSummary(item.summary),
          },
        ]
      : [],
  );
}

function readIndex(): KingdomMeta[] {
  return parseIndex(storage.getItem(STORAGE_KEYS.kingdoms));
}

function writeIndex(kingdoms: KingdomMeta[]): void {
  storage.setItem(STORAGE_KEYS.kingdoms, JSON.stringify(kingdoms));
  notify();
}

let snapshot: { content: string | null; kingdoms: KingdomMeta[] } | null = null;

/** Kingdoms of this device, most recently created first (stable reference between changes). */
export function listKingdoms(): KingdomMeta[] {
  const content = storage.getItem(STORAGE_KEYS.kingdoms);
  if (snapshot?.content !== content) {
    snapshot = { content, kingdoms: parseIndex(content).sort((a, b) => b.createdAt - a.createdAt) };
  }
  return snapshot.kingdoms;
}

export function getKingdom(id: string): KingdomMeta | null {
  return listKingdoms().find(kingdom => kingdom.id === id) ?? null;
}

/** Adds (or updates) a kingdom in the index. */
export function upsertKingdom(kingdom: KingdomMeta): void {
  const others = readIndex().filter(k => k.id !== kingdom.id);
  writeIndex([...others, kingdom]);
}

/** Creates an empty kingdom; its save is written once the game starts. */
export function createKingdom(id: string, name: string): KingdomMeta {
  const kingdom: KingdomMeta = { id, name, createdAt: Date.now(), summary: EMPTY_SUMMARY };
  upsertKingdom(kingdom);
  return kingdom;
}

/** Removes a kingdom and its save from this device. */
export function deleteKingdom(id: string): void {
  storage.removeItem(saveKey(id));
  writeIndex(readIndex().filter(k => k.id !== id));
}

/** Loads the saves of the indexed kingdoms into the storage cache (startup). */
export function hydrateSaves(): Promise<void> {
  return hydrateKeys(readIndex().map(k => saveKey(k.id)));
}

/**
 * Turns the single save of older versions into a kingdom, so no player loses their game.
 * Returns the migrated save, if any.
 */
export function migrateLegacySave(name: string): SaveData | null {
  const save = parseSave(parseJson(storage.getItem(STORAGE_KEYS.legacySave)));
  storage.removeItem(STORAGE_KEYS.legacySave);
  if (!save) return null;
  writeSave(save);
  if (!getKingdom(save.id)) {
    upsertKingdom({ id: save.id, name, createdAt: save.savedAt, summary: EMPTY_SUMMARY });
  }
  return save;
}

// ─── Saves ───────────────────────────────────────────────────────────────────

const parsedSaves = new Map<string, { raw: string | null; save: SaveData | null }>();

/** A kingdom's save, parsed once per stored version (read-only: write with `writeSave`). */
export function loadSave(id: string): SaveData | null {
  const raw = storage.getItem(saveKey(id));
  const cached = parsedSaves.get(id);
  if (cached?.raw === raw) return cached.save;
  const save = parseSave(parseJson(raw));
  parsedSaves.set(id, { raw, save });
  return save;
}

export function writeSave(save: SaveData): void {
  storage.setItem(saveKey(save.id), JSON.stringify(save));
}

/** Saves the game after a change; it will be pushed to the server at the next sync. */
export function saveGame(
  id: string,
  events: GameEvent[],
  cardNames: Record<string, string>,
  summary: KingdomSummary,
): void {
  const previous = loadSave(id);
  // A rewind followed by a new move changes events the server already has.
  const syncedUpTo = previous
    ? Math.min(previous.sync.syncedUpTo ?? 0, commonPrefix(previous.events, events))
    : 0;
  writeSave({
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
  });
  const kingdom = getKingdom(id);
  if (kingdom) upsertKingdom({ ...kingdom, summary });
}

/** Records a sync accepted by (or refused by) the server, unless the save changed meanwhile. */
export function updateSyncInfo(id: string, savedAt: number, sync: SyncInfo): void {
  const current = loadSave(id);
  if (current?.savedAt !== savedAt) return;
  writeSave({ ...current, sync });
}

/**
 * Records a sync accepted by the server. The server version is kept even when the player kept
 * playing meanwhile, so the next push builds on it; the save then stays dirty.
 */
export function recordAcceptedSync(
  id: string,
  pushed: Pick<SaveData, 'events' | 'savedAt'>,
  userId: string,
  serverVersion: number,
): void {
  const current = loadSave(id);
  if (!current) return;
  const syncedUpTo = commonPrefix(pushed.events, current.events);
  const changed = current.savedAt !== pushed.savedAt || syncedUpTo < current.events.length;
  writeSave({ ...current, sync: { dirty: changed, userId, serverVersion, syncedUpTo } });
}

// ─── Games abandoned while offline ───────────────────────────────────────────

/** Server games to abandon at the next sync (kingdoms deleted while offline). */
export function getPendingAbandons(): string[] {
  const ids = parseJson(storage.getItem(STORAGE_KEYS.pendingAbandons));
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
}

export function setPendingAbandons(ids: string[]): void {
  if (ids.length === 0) storage.removeItem(STORAGE_KEYS.pendingAbandons);
  else storage.setItem(STORAGE_KEYS.pendingAbandons, JSON.stringify(ids));
}

/** Deletes a kingdom on this device and abandons it on the server (now or at the next sync). */
export function abandonKingdom(id: string): void {
  setPendingAbandons([...new Set([...getPendingAbandons(), id])]);
  deleteKingdom(id);
}
