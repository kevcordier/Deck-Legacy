import type { SyncStatus } from './SyncStatus';
import { ApiError } from '@application/ports/ApiError';
import type { GameApi } from '@application/ports/GameApi';
import type { KingdomRepository } from '@application/ports/KingdomRepository';
import type { GameSummary } from '@application/ports/apiTypes';
import type { KingdomMeta } from '@domain/kingdom/KingdomMeta';
import type { SaveData } from '@domain/kingdom/SaveData';
import { commonPrefix } from '@domain/kingdom/commonPrefix';

const RETRY_DELAY_MS = 60_000;
const DEBOUNCE_MS = 1_500;

function statusForError(error: unknown): SyncStatus {
  return error instanceof ApiError && error.status !== 0 ? 'pending' : 'offline';
}

/**
 * Background sync of the local kingdoms with the server.
 *
 * Games are always played locally (offline included). When a registered account is signed in, the events the
 * server does not have yet are pushed after changes (debounced), built on the server version
 * the device last saw. On startup, on return to the foreground and every minute,
 * `reconcile()` downloads the kingdoms another device moved forward when this device has no
 * unsynced changes for them. When both moved, the server refuses the push and the kingdom is
 * in `conflict` until the player keeps one version (`resolveConflict`).
 */
export class SyncService {
  private userId: string | null = null;
  private status: SyncStatus = 'signedOut';
  private running: Promise<void> | null = null;
  private reconciling: Promise<void> | null = null;
  private rerun = false;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setInterval> | null = null;
  private readonly listeners = new Set<() => void>();
  private readonly replacedListeners = new Set<(id: string) => void>();

  constructor(
    private readonly api: GameApi,
    private readonly kingdoms: KingdomRepository,
  ) {}

  readonly getStatus = (): SyncStatus => this.status;

  readonly subscribeStatus = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Called with a kingdom id when `reconcile` replaced its local save with the server's. */
  subscribeSaveReplaced(listener: (id: string) => void): () => void {
    this.replacedListeners.add(listener);
    return () => this.replacedListeners.delete(listener);
  }

  /** Sets (or clears) the account that receives the saves, and starts the retry loop. */
  setUser(id: string | null): void {
    this.userId = id;
    if (this.retryTimer) clearInterval(this.retryTimer);
    this.retryTimer = null;
    if (!id) {
      this.setStatus('signedOut');
      return;
    }
    // Also picks up what other devices synced meanwhile.
    this.retryTimer = setInterval(() => void this.reconcile(id), RETRY_DELAY_MS);
  }

  /** Pushes the local saves now (one push at a time; a request during a push runs after it). */
  syncNow(): Promise<void> {
    if (this.running) {
      this.rerun = true;
      return this.running;
    }
    const account = this.userId;
    if (!account) {
      this.setStatus('signedOut');
      return Promise.resolve();
    }
    this.setStatus('syncing');
    this.running = this.pushSaves(account)
      .catch(error => this.setStatus(statusForError(error)))
      .finally(() => {
        this.running = null;
        if (this.rerun) {
          this.rerun = false;
          void this.syncNow();
        }
      });
    return this.running;
  }

  /** Called after every local save: pushes once the player pauses. */
  schedule(): void {
    if (!this.userId) return;
    this.setStatus('pending');
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.syncNow();
    }, DEBOUNCE_MS);
  }

  /** After sign-out: the kingdoms synced with an account stay on it, remove them from this device. */
  forgetAccountKingdoms(): void {
    this.forgetOtherAccounts('');
  }

  /**
   * Aligns the local kingdoms with the server for the signed-in account:
   * - kingdoms synced with another account are removed (they stay on that account);
   * - unsynced local changes win and are pushed;
   * - the account's other kingdoms are downloaded, and synced kingdoms the server no longer
   *   has (deleted on another device) are removed.
   */
  reconcile(account: string): Promise<void> {
    this.reconciling ??= this.runReconcile(account).finally(() => {
      this.reconciling = null;
    });
    return this.reconciling;
  }

  /**
   * Ends a conflict: `server` drops this device's unsynced changes and downloads the server
   * version; `mine` overwrites the server version with this device's game.
   */
  async resolveConflict(id: string, keep: 'server' | 'mine'): Promise<void> {
    const save = this.kingdoms.loadSave(id);
    const account = this.userId;
    if (!save || !account) return;
    const { conflict: _conflict, syncedUpTo: _syncedUpTo, serverVersion, ...sync } = save.sync;
    if (keep === 'server') {
      this.kingdoms.updateSyncInfo(id, save.savedAt, { ...sync, dirty: false, serverVersion });
      await this.reconcile(account);
    } else {
      this.kingdoms.updateSyncInfo(id, save.savedAt, { ...sync, dirty: true });
      await this.syncNow();
    }
  }

  private setStatus(next: SyncStatus): void {
    if (next === this.status) return;
    this.status = next;
    for (const listener of this.listeners) listener();
  }

  /** Status once every push is done, from what the local saves still hold. */
  private settledStatus(): SyncStatus {
    const saves = this.kingdoms.list().map(k => this.kingdoms.loadSave(k.id));
    if (saves.some(save => save?.sync.conflict)) return 'conflict';
    if (saves.some(save => save?.sync.limited)) return 'limited';
    if (saves.some(save => save?.sync.rejected)) return 'rejected';
    if (saves.some(save => save?.sync.dirty)) return 'pending';
    return 'synced';
  }

  /** Abandons, on the server, the kingdoms the player deleted (offline included). */
  private async processPendingAbandons(): Promise<void> {
    const remaining: string[] = [];
    for (const id of this.kingdoms.getPendingAbandons()) {
      try {
        await this.api.abandonGame(id);
      } catch (error) {
        // Unknown on the server (never synced): nothing to abandon.
        if (!(error instanceof ApiError && error.status === 404)) remaining.push(id);
      }
    }
    this.kingdoms.setPendingAbandons(remaining);
    if (remaining.length > 0) throw new ApiError(0, null);
  }

  /**
   * After `STALE_VERSION`: when the server log only holds events this device already has (a
   * sync whose response was lost), there is no conflict. Builds on the server version instead.
   */
  private async catchUpWithServer(save: SaveData): Promise<boolean> {
    const remote = await this.api.exportGame(save.id);
    if (commonPrefix(remote.events, save.events) < remote.events.length) return false;
    this.kingdoms.updateSyncInfo(save.id, save.savedAt, {
      ...save.sync,
      serverVersion: remote.version,
      syncedUpTo: remote.events.length,
    });
    return true;
  }

  private async pushKingdom(account: string, kingdom: KingdomMeta, retry = true): Promise<void> {
    const save = this.kingdoms.loadSave(kingdom.id);
    if (!save?.sync.dirty || save.sync.rejected || save.sync.limited || save.sync.conflict) return;
    // A save last synced with another account is removed by `reconcile`, never pushed here.
    if (save.sync.userId && save.sync.userId !== account) return;

    // Without a known server version (new or legacy save, or overwrite chosen), send everything.
    const baseVersion = save.sync.serverVersion;
    const fromSeq = baseVersion === undefined ? 0 : (save.sync.syncedUpTo ?? 0);
    try {
      const summary = await this.api.syncGame(save.id, {
        events: save.events.slice(fromSeq),
        fromSeq,
        ...(baseVersion === undefined ? {} : { baseVersion }),
        cardNames: save.cardNames,
        name: kingdom.name,
      });
      this.kingdoms.recordAcceptedSync(save.id, save, account, summary.version);
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      if (error.code === 'STALE_VERSION' && retry && (await this.catchUpWithServer(save))) {
        return this.pushKingdom(account, kingdom, false);
      }
      this.recordRefusal(save, error);
    }
  }

  /** Marks a save the server refused; rethrows errors worth retrying later (network…). */
  private recordRefusal(save: SaveData, error: ApiError): void {
    if (error.code === 'STALE_VERSION') {
      this.kingdoms.updateSyncInfo(save.id, save.savedAt, { ...save.sync, conflict: true });
    } else if (error.status === 422) {
      console.warn('The server refused a local save', error.message);
      this.kingdoms.updateSyncInfo(save.id, save.savedAt, { ...save.sync, rejected: true });
    } else if (error.code === 'KINGDOM_LIMIT') {
      this.kingdoms.updateSyncInfo(save.id, save.savedAt, { ...save.sync, limited: true });
    } else {
      throw error;
    }
  }

  private async pushSaves(account: string): Promise<void> {
    await this.processPendingAbandons();
    for (const kingdom of this.kingdoms.list()) {
      await this.pushKingdom(account, kingdom);
    }
    this.setStatus(this.settledStatus());
  }

  private isUnchanged(id: string, before: SaveData | null): boolean {
    return this.kingdoms.loadSave(id)?.savedAt === before?.savedAt;
  }

  /** Downloads a server kingdom unless this device has unsynced changes for it. */
  private async adoptServerKingdom(account: string, remote: GameSummary): Promise<boolean> {
    const local = this.kingdoms.loadSave(remote.id);
    const kingdom = this.kingdoms.get(remote.id);
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
        this.kingdoms.upsert({ ...meta, summary: kingdom?.summary ?? summary });
      }
      return false;
    }

    const exported = await this.api.exportGame(remote.id);
    // The player kept playing while we were downloading: keep the local game.
    if (!this.isUnchanged(remote.id, local)) return false;
    this.kingdoms.writeSave({
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
      ...(exported.checkpoint ? { checkpoint: exported.checkpoint } : {}),
    });
    this.kingdoms.upsert(meta);
    return true;
  }

  /** Kingdoms synced with another account stay on that account: remove them from this device. */
  private forgetOtherAccounts(account: string): void {
    for (const kingdom of this.kingdoms.list()) {
      const save = this.kingdoms.loadSave(kingdom.id);
      const owner = save?.sync.userId;
      if (owner && owner !== account) this.kingdoms.delete(kingdom.id);
      // The limit depends on the account (guest or registered): try again.
      else if (save?.sync.limited) {
        this.kingdoms.updateSyncInfo(save.id, save.savedAt, { ...save.sync, limited: undefined });
      }
    }
  }

  /** Synced kingdoms the server no longer has were deleted on another device. */
  private forgetDeletedKingdoms(account: string, remote: GameSummary[]): void {
    const remoteIds = new Set(remote.map(game => game.id));
    for (const kingdom of this.kingdoms.list()) {
      const save = this.kingdoms.loadSave(kingdom.id);
      if (save && !save.sync.dirty && save.sync.userId === account && !remoteIds.has(save.id)) {
        this.kingdoms.delete(kingdom.id);
      }
    }
  }

  private async runReconcile(account: string): Promise<void> {
    try {
      this.forgetOtherAccounts(account);
      await this.syncNow();
      const remote = await this.api.listGames();
      this.forgetDeletedKingdoms(account, remote);
      for (const game of remote) {
        if (await this.adoptServerKingdom(account, game)) {
          for (const listener of this.replacedListeners) listener(game.id);
        }
      }
      this.setStatus(this.settledStatus());
    } catch (error) {
      this.setStatus(statusForError(error));
    }
  }
}
