import { isRecord } from './isRecord';
import type { GameCheckpoint, GameEvent, GameState } from '@deck-legacy/engine/domain/types';
import type { SaveData } from '@domain/kingdom/SaveData';
import type { SyncInfo } from '@domain/kingdom/SyncInfo';

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

function toCheckpoint(value: unknown): GameCheckpoint | undefined {
  if (!isRecord(value) || typeof value.seq !== 'number' || !isRecord(value.state)) return undefined;
  return { seq: value.seq, state: value.state as unknown as GameState };
}

/**
 * Reads a stored save (current format or the former single-save versions). Saves written by
 * older versions have no `sync` field and are treated as not yet synced.
 */
export function parseSave(raw: unknown): SaveData | null {
  if (!isRecord(raw) || typeof raw.id !== 'string' || !Array.isArray(raw.events)) return null;
  const checkpoint = toCheckpoint(raw.checkpoint);
  return {
    id: raw.id,
    events: raw.events as GameEvent[],
    cardNames: toCardNames(raw.cardNames),
    savedAt: typeof raw.savedAt === 'number' ? raw.savedAt : Date.now(),
    sync: toSyncInfo(raw.sync),
    ...(checkpoint ? { checkpoint } : {}),
  };
}
