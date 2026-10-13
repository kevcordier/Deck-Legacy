/**
 * Background sync of the local kingdoms with the server.
 *
 * Games are always played locally (offline included). When a session exists, the events the
 * server does not have yet are pushed after changes (debounced), built on the server version
 * the device last saw. On startup, on return to the foreground and every minute,
 * `reconcile()` downloads the kingdoms another device moved forward when this device has no
 * unsynced changes for them. When both moved, the server refuses the push and the kingdom is
 * in `conflict` until the player keeps one version (`resolveConflict`).
 */
import type { GameSummary } from '@deck-legacy/api-contract';
import { ApiError, api } from '@services/api';
import {
  type KingdomMeta,
  type SaveData,
  commonPrefix,
  deleteKingdom,
  getKingdom,
  getPendingAbandons,
  listKingdoms,
  loadSave,
  recordAcceptedSync,
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
  | 'limited' // the server refused a new kingdom (kingdom limit reached)
  | 'conflict'; // another device synced a kingdom this device also changed

const RETRY_DELAY_MS = 60_000;
const DEBOUNCE_MS = 1_500;

let userId: string | null = null;
let status: SyncStatus = 'signedOut';
let running: Promise<void> | null = null;
let reconciling: Promise<void> | null = null;
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
  if (saves.some(save => save?.sync.conflict)) return 'conflict';
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
  // Also picks up what other devices synced meanwhile.
  retryTimer = setInterval(() => void reconcile(id), RETRY_DELAY_MS);
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

/**
 * After `STALE_VERSION`: when the server log only holds events this device already has (a
 * sync whose response was lost), there is no conflict. Builds on the server version instead.
 */
async function catchUpWithServer(save: SaveData): Promise<boolean> {
  const remote = await api.exportGame(save.id);
  if (commonPrefix(remote.events, save.events) < remote.events.length) return false;
  updateSyncInfo(save.id, save.savedAt, {
    ...save.sync,
    serverVersion: remote.version,
    syncedUpTo: remote.events.length,
  });
  return true;
}

async function pushKingdom(account: string, kingdom: KingdomMeta, retry = true): Promise<void> {
  const save = loadSave(kingdom.id);
  if (!save?.sync.dirty || save.sync.rejected || save.sync.limited || save.sync.conflict) return;
  // A save last synced with another account is removed by `reconcile`, never pushed here.
  if (save.sync.userId && save.sync.userId !== account) return;

  // Without a known server version (new or legacy save, or overwrite chosen), send everything.
  const baseVersion = save.sync.serverVersion;
  const fromSeq = baseVersion === undefined ? 0 : (save.sync.syncedUpTo ?? 0);
  try {
    const summary = await api.syncGame(save.id, {
      events: save.events.slice(fromSeq),
      fromSeq,
      ...(baseVersion === undefined ? {} : { baseVersion }),
      cardNames: save.cardNames,
      name: kingdom.name,
    });
    recordAcceptedSync(save.id, save, account, summary.version);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.code === 'STALE_VERSION' && retry && (await catchUpWithServer(save))) {
      return pushKingdom(account, kingdom, false);
    }
    recordRefusal(save, error);
  }
}

/** Marks a save the server refused; rethrows errors worth retrying later (network…). */
function recordRefusal(save: SaveData, error: ApiError): void {
  if (error.code === 'STALE_VERSION') {
    updateSyncInfo(save.id, save.savedAt, { ...save.sync, conflict: true });
  } else if (error.status === 422) {
    console.warn('The server refused a local save', error.message);
    updateSyncInfo(save.id, save.savedAt, { ...save.sync, rejected: true });
  } else if (error.code === 'KINGDOM_LIMIT') {
    updateSyncInfo(save.id, save.savedAt, { ...save.sync, limited: true });
  } else {
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
    sync: {
      dirty: false,
      userId: account,
      serverVersion: remote.version,
      syncedUpTo: exported.events.length,
    },
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
export function reconcile(account: string): Promise<void> {
  reconciling ??= runReconcile(account).finally(() => {
    reconciling = null;
  });
  return reconciling;
}

async function runReconcile(account: string): Promise<void> {
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

/**
 * Ends a conflict: `server` drops this device's unsynced changes and downloads the server
 * version; `mine` overwrites the server version with this device's game.
 */
export async function resolveConflict(id: string, keep: 'server' | 'mine'): Promise<void> {
  const save = loadSave(id);
  const account = userId;
  if (!save || !account) return;
  const { conflict: _conflict, syncedUpTo: _syncedUpTo, serverVersion, ...sync } = save.sync;
  if (keep === 'server') {
    updateSyncInfo(id, save.savedAt, { ...sync, dirty: false, serverVersion });
    await reconcile(account);
  } else {
    updateSyncInfo(id, save.savedAt, { ...sync, dirty: true });
    await syncNow();
  }
}
