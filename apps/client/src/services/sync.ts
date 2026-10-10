/**
 * Background sync of the local kingdoms with the server.
 *
 * Games are always played locally (offline included). When a session exists, the full event
 * log of each changed kingdom is pushed after changes (debounced) and retried while offline.
 * On startup or account change, `reconcile()` downloads the account's kingdoms that this
 * device has no unsynced changes for, which lets a player continue on another device.
 */
import type { GameSummary } from '@deck-legacy/api-contract';
import { ApiError, api } from '@services/api';
import {
  type KingdomMeta,
  type SaveData,
  deleteKingdom,
  getKingdom,
  getPendingAbandons,
  listKingdoms,
  loadSave,
  setPendingAbandons,
  updateSyncInfo,
  upsertKingdom,
  writeSave,
} from '@services/persistence';

export type SyncStatus =
  | 'signedOut' // no session yet: nothing is sent
  | 'syncing'
  | 'synced' // the server has the latest local saves
  | 'pending' // local changes not sent yet
  | 'offline' // the server could not be reached; retried later
  | 'rejected' // the server refused a save (cannot be replayed)
  | 'limited'; // the server refused a new kingdom (kingdom limit reached)

const RETRY_DELAY_MS = 60_000;
const DEBOUNCE_MS = 1_500;

let userId: string | null = null;
let status: SyncStatus = 'signedOut';
let running: Promise<void> | null = null;
let rerun = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let retryTimer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();
const replacedListeners = new Set<(id: string) => void>();

function setStatus(next: SyncStatus): void {
  if (next === status) return;
  status = next;
  for (const listener of listeners) listener();
}

export function getSyncStatus(): SyncStatus {
  return status;
}

export function subscribeSyncStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Called with a kingdom id when `reconcile` replaced its local save with the server's. */
export function subscribeSaveReplaced(listener: (id: string) => void): () => void {
  replacedListeners.add(listener);
  return () => replacedListeners.delete(listener);
}

function statusForError(error: unknown): SyncStatus {
  return error instanceof ApiError && error.status !== 0 ? 'pending' : 'offline';
}

/** Status once every push is done, from what the local saves still hold. */
function settledStatus(): SyncStatus {
  const saves = listKingdoms().map(k => loadSave(k.id));
  if (saves.some(save => save?.sync.limited)) return 'limited';
  if (saves.some(save => save?.sync.rejected)) return 'rejected';
  if (saves.some(save => save?.sync.dirty)) return 'pending';
  return 'synced';
}

/** Sets (or clears) the account that receives the saves, and starts the retry loop. */
export function setSyncUser(id: string | null): void {
  userId = id;
  if (retryTimer) clearInterval(retryTimer);
  retryTimer = null;
  if (!id) {
    setStatus('signedOut');
    return;
  }
  retryTimer = setInterval(() => {
    if (status === 'offline' || status === 'pending') void syncNow();
  }, RETRY_DELAY_MS);
}

/** Abandons, on the server, the kingdoms the player deleted (offline included). */
async function processPendingAbandons(): Promise<void> {
  const remaining: string[] = [];
  for (const id of getPendingAbandons()) {
    try {
      await api.abandonGame(id);
    } catch (error) {
      // Unknown on the server (never synced): nothing to abandon.
      if (!(error instanceof ApiError && error.status === 404)) remaining.push(id);
    }
  }
  setPendingAbandons(remaining);
  if (remaining.length > 0) throw new ApiError(0, null);
}

async function pushKingdom(account: string, kingdom: KingdomMeta): Promise<void> {
  const save = loadSave(kingdom.id);
  if (!save?.sync.dirty || save.sync.rejected || save.sync.limited) return;
  // A save last synced with another account is removed by `reconcile`, never pushed here.
  if (save.sync.userId && save.sync.userId !== account) return;

  try {
    const summary = await api.syncGame(save.id, {
      events: save.events,
      cardNames: save.cardNames,
      name: kingdom.name,
    });
    updateSyncInfo(save.id, save.savedAt, {
      dirty: false,
      userId: account,
      serverVersion: summary.version,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      console.warn('The server refused a local save', error.message);
      updateSyncInfo(save.id, save.savedAt, { ...save.sync, rejected: true });
      return;
    }
    if (error instanceof ApiError && error.code === 'KINGDOM_LIMIT') {
      updateSyncInfo(save.id, save.savedAt, { ...save.sync, limited: true });
      return;
    }
    throw error;
  }
}

async function pushSaves(account: string): Promise<void> {
  await processPendingAbandons();
  for (const kingdom of listKingdoms()) {
    await pushKingdom(account, kingdom);
  }
  setStatus(settledStatus());
}

/** Pushes the local saves now (one push at a time; a request during a push runs after it). */
export function syncNow(): Promise<void> {
  if (running) {
    rerun = true;
    return running;
  }
  const account = userId;
  if (!account) {
    setStatus('signedOut');
    return Promise.resolve();
  }
  setStatus('syncing');
  running = pushSaves(account)
    .catch(error => setStatus(statusForError(error)))
    .finally(() => {
      running = null;
      if (rerun) {
        rerun = false;
        void syncNow();
      }
    });
  return running;
}

/** Called after every local save: pushes once the player pauses. */
export function scheduleSync(): void {
  if (!userId) return;
  setStatus('pending');
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void syncNow();
  }, DEBOUNCE_MS);
}

function isUnchanged(id: string, before: SaveData | null): boolean {
  return loadSave(id)?.savedAt === before?.savedAt;
}

/** Downloads a server kingdom unless this device has unsynced changes for it. */
async function adoptServerKingdom(account: string, remote: GameSummary): Promise<boolean> {
  const local = loadSave(remote.id);
  const kingdom = getKingdom(remote.id);
  if (local?.sync.dirty) return false;
  const summary = { score: remote.score, segments: remote.segments, finished: remote.finished };
  const meta: KingdomMeta = {
    id: remote.id,
    name: remote.name,
    createdAt: kingdom?.createdAt ?? Date.parse(remote.updatedAt),
    summary,
  };
  const upToDate =
    local?.events.length === remote.eventCount &&
    local.sync.userId === account &&
    local.sync.serverVersion === remote.version;
  if (upToDate) {
    if (kingdom?.name !== remote.name) {
      upsertKingdom({ ...meta, summary: kingdom?.summary ?? summary });
    }
    return false;
  }

  const exported = await api.exportGame(remote.id);
  // The player kept playing while we were downloading: keep the local game.
  if (!isUnchanged(remote.id, local)) return false;
  writeSave({
    id: exported.id,
    events: exported.events,
    cardNames: exported.cardNames,
    savedAt: Date.now(),
    sync: { dirty: false, userId: account, serverVersion: remote.version },
  });
  upsertKingdom(meta);
  return true;
}

/** Kingdoms synced with another account stay on that account: remove them from this device. */
function forgetOtherAccounts(account: string): void {
  for (const kingdom of listKingdoms()) {
    const save = loadSave(kingdom.id);
    const owner = save?.sync.userId;
    if (owner && owner !== account) deleteKingdom(kingdom.id);
    // The limit depends on the account (guest or registered): try again.
    else if (save?.sync.limited) {
      updateSyncInfo(save.id, save.savedAt, { ...save.sync, limited: undefined });
    }
  }
}

/** Synced kingdoms the server no longer has were deleted on another device. */
function forgetDeletedKingdoms(account: string, remote: GameSummary[]): void {
  const remoteIds = new Set(remote.map(game => game.id));
  for (const kingdom of listKingdoms()) {
    const save = loadSave(kingdom.id);
    if (save && !save.sync.dirty && save.sync.userId === account && !remoteIds.has(save.id)) {
      deleteKingdom(kingdom.id);
    }
  }
}

/**
 * Aligns the local kingdoms with the server for the signed-in account:
 * - kingdoms synced with another account are removed (they stay on that account);
 * - unsynced local changes win and are pushed;
 * - the account's other kingdoms are downloaded, and synced kingdoms the server no longer
 *   has (deleted on another device) are removed.
 */
export async function reconcile(account: string): Promise<void> {
  try {
    forgetOtherAccounts(account);
    await syncNow();
    const remote = await api.listGames();
    forgetDeletedKingdoms(account, remote);
    for (const game of remote) {
      if (await adoptServerKingdom(account, game)) {
        for (const listener of replacedListeners) listener(game.id);
      }
    }
    setStatus(settledStatus());
  } catch (error) {
    setStatus(statusForError(error));
  }
}
