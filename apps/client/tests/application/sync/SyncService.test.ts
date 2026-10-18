import { memory, memoryStorage } from '../../memoryStorage';
import { ApiError } from '@application/ports/ApiError';
import { SyncService } from '@application/sync/SyncService';
import { EMPTY_SUMMARY } from '@domain/kingdom/emptySummary';
import { LocalKingdomStore } from '@infrastructure/storage/LocalKingdomStore';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const api = {
  listGames: vi.fn(),
  syncGame: vi.fn(),
  exportGame: vi.fn(),
  abandonGame: vi.fn(),
};
const store = new LocalKingdomStore(memoryStorage);
const sync = new SyncService(api, store);

const events = [{ id: 'e1', type: 'gameStarted', timestamp: 1 }] as never[];
const summary = {
  id: 'g1',
  name: 'Avalon',
  version: 4,
  eventCount: 1,
  score: 7,
  segments: [{ segment: 'base', score: 7 }],
  finished: false,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

/** A local kingdom with a save. */
function kingdom(id: string, name = 'Avalon') {
  store.create(id, name);
  store.saveGame(id, events, {}, EMPTY_SUMMARY);
}

function markSynced(id: string, userId = 'u1', serverVersion = 4) {
  store.updateSyncInfo(id, store.loadSave(id)?.savedAt ?? 0, {
    dirty: false,
    userId,
    serverVersion,
  });
}

beforeEach(() => {
  memory.clear();
  for (const fn of Object.values(api)) fn.mockReset();
  api.listGames.mockResolvedValue([]);
  sync.setUser('u1');
});

afterEach(() => sync.setUser(null));

describe('sync.syncNow', () => {
  it('does nothing without a session', async () => {
    sync.setUser(null);
    kingdom('g1');

    await sync.syncNow();

    expect(api.syncGame).not.toHaveBeenCalled();
    expect(sync.getStatus()).toBe('signedOut');
  });

  it('pushes every dirty kingdom with its name and records the server version', async () => {
    kingdom('g1');
    kingdom('g2', 'Camelot');
    markSynced('g2');
    api.syncGame.mockResolvedValue(summary);

    await sync.syncNow();

    expect(api.syncGame).toHaveBeenCalledOnce();
    expect(api.syncGame).toHaveBeenCalledWith('g1', {
      events,
      fromSeq: 0,
      cardNames: {},
      name: 'Avalon',
    });
    expect(store.loadSave('g1')?.sync).toEqual({
      dirty: false,
      userId: 'u1',
      serverVersion: 4,
      syncedUpTo: 1,
    });
    expect(sync.getStatus()).toBe('synced');
  });

  it('marks a save as rejected when the server cannot replay it', async () => {
    kingdom('g1');
    api.syncGame.mockRejectedValue(new ApiError(422, null));

    await sync.syncNow();
    expect(sync.getStatus()).toBe('rejected');

    await sync.syncNow();
    expect(api.syncGame).toHaveBeenCalledOnce();
  });

  it('keeps a kingdom local when the server limit is reached', async () => {
    kingdom('g1');
    api.syncGame.mockRejectedValue(
      new ApiError(409, { statusCode: 409, code: 'KINGDOM_LIMIT', message: '' }),
    );

    await sync.syncNow();

    expect(store.loadSave('g1')?.sync.limited).toBe(true);
    expect(sync.getStatus()).toBe('limited');
  });

  it('skips saves synced with another account', async () => {
    kingdom('g1');
    store.updateSyncInfo('g1', store.loadSave('g1')?.savedAt ?? 0, {
      dirty: true,
      userId: 'other',
    });

    await sync.syncNow();

    expect(api.syncGame).not.toHaveBeenCalled();
    expect(sync.getStatus()).toBe('pending');
  });

  it('reports offline on network errors and keeps the save dirty', async () => {
    kingdom('g1');
    api.syncGame.mockRejectedValue(new ApiError(0, null));

    await sync.syncNow();

    expect(sync.getStatus()).toBe('offline');
    expect(store.loadSave('g1')?.sync.dirty).toBe(true);
  });

  it('abandons deleted kingdoms, keeping failures for later', async () => {
    store.setPendingAbandons(['gone', 'unknown', 'later']);
    api.abandonGame.mockImplementation(async (id: string) => {
      if (id === 'unknown') throw new ApiError(404, null);
      if (id === 'later') throw new ApiError(0, null);
    });

    await sync.syncNow();

    expect(api.abandonGame).toHaveBeenCalledTimes(3);
    expect(store.getPendingAbandons()).toEqual(['later']);
    expect(sync.getStatus()).toBe('offline');
  });
});

describe('delta sync', () => {
  const more = [...events, { id: 'e2', type: 'cardProduced', timestamp: 2 }] as never[];

  it('pushes only the events the server lacks, built on its version', async () => {
    kingdom('g1');
    api.syncGame.mockResolvedValue(summary);
    await sync.syncNow();
    store.saveGame('g1', more, {}, EMPTY_SUMMARY);
    api.syncGame.mockResolvedValue({ ...summary, version: 5 });

    await sync.syncNow();

    expect(api.syncGame).toHaveBeenLastCalledWith('g1', {
      events: more.slice(1),
      fromSeq: 1,
      baseVersion: 4,
      cardNames: {},
      name: 'Avalon',
    });
    expect(store.loadSave('g1')?.sync).toMatchObject({ serverVersion: 5, syncedUpTo: 2 });
  });

  it('resends the events changed by a rewind', async () => {
    kingdom('g1');
    store.saveGame('g1', more, {}, EMPTY_SUMMARY);
    markSynced('g1');
    store.updateSyncInfo('g1', store.loadSave('g1')?.savedAt ?? 0, {
      ...(store.loadSave('g1')?.sync ?? { dirty: false }),
      syncedUpTo: 2,
    });
    store.saveGame('g1', events, {}, EMPTY_SUMMARY);
    store.saveGame('g1', [...events, { id: 'e3' }] as never[], {}, EMPTY_SUMMARY);

    expect(store.loadSave('g1')?.sync.syncedUpTo).toBe(1);
  });

  it('keeps the new server version when the player played during the push', async () => {
    kingdom('g1');
    api.syncGame.mockImplementation(async () => {
      store.saveGame('g1', more, {}, EMPTY_SUMMARY);
      return summary;
    });

    await sync.syncNow();

    expect(store.loadSave('g1')?.sync).toEqual({
      dirty: true,
      userId: 'u1',
      serverVersion: 4,
      syncedUpTo: 1,
    });
  });

  it('flags a conflict when another device synced first, until the player chooses', async () => {
    kingdom('g1');
    markSynced('g1');
    store.saveGame('g1', more, {}, EMPTY_SUMMARY);
    api.syncGame.mockRejectedValue(
      new ApiError(409, { statusCode: 409, code: 'STALE_VERSION', message: '' }),
    );
    // The other device added an event this one does not have.
    api.exportGame.mockResolvedValue({
      ...summary,
      version: 5,
      events: [...events, { id: 'other' }],
      cardNames: {},
      savedAt: 0,
    });

    await sync.syncNow();
    expect(sync.getStatus()).toBe('conflict');
    store.saveGame('g1', [...more, { id: 'e3' }] as never[], {}, EMPTY_SUMMARY);
    await sync.syncNow();
    expect(api.syncGame).toHaveBeenCalledOnce();
    expect(store.loadSave('g1')?.sync.conflict).toBe(true);
  });

  it('builds on the server version when only the response of an accepted push was lost', async () => {
    kingdom('g1');
    markSynced('g1');
    store.saveGame('g1', more, {}, EMPTY_SUMMARY);
    // The server stored `more` (version 5) but the device never got the answer.
    api.syncGame
      .mockRejectedValueOnce(
        new ApiError(409, { statusCode: 409, code: 'STALE_VERSION', message: '' }),
      )
      .mockResolvedValueOnce({ ...summary, version: 6, eventCount: 2 });
    api.exportGame.mockResolvedValue({
      ...summary,
      version: 5,
      events: more,
      cardNames: {},
      savedAt: 0,
    });

    await sync.syncNow();

    expect(api.syncGame).toHaveBeenLastCalledWith('g1', {
      events: [],
      fromSeq: 2,
      baseVersion: 5,
      cardNames: {},
      name: 'Avalon',
    });
    expect(store.loadSave('g1')?.sync).toMatchObject({ dirty: false, serverVersion: 6 });
    expect(sync.getStatus()).toBe('synced');
  });

  it('overwrites the server with the whole local game when the player keeps theirs', async () => {
    kingdom('g1');
    store.updateSyncInfo('g1', store.loadSave('g1')?.savedAt ?? 0, {
      dirty: true,
      userId: 'u1',
      serverVersion: 4,
      syncedUpTo: 1,
      conflict: true,
    });
    api.syncGame.mockResolvedValue({ ...summary, version: 6 });

    await sync.resolveConflict('g1', 'mine');

    expect(api.syncGame).toHaveBeenCalledWith('g1', {
      events,
      fromSeq: 0,
      cardNames: {},
      name: 'Avalon',
    });
    expect(sync.getStatus()).toBe('synced');
  });

  it('downloads the server version when the player keeps it', async () => {
    kingdom('g1');
    store.updateSyncInfo('g1', store.loadSave('g1')?.savedAt ?? 0, {
      dirty: true,
      userId: 'u1',
      serverVersion: 4,
      conflict: true,
    });
    api.listGames.mockResolvedValue([{ ...summary, version: 6, eventCount: 2 }]);
    api.exportGame.mockResolvedValue({
      id: 'g1',
      name: 'Avalon',
      events: more,
      cardNames: {},
      savedAt: 0,
    });

    await sync.resolveConflict('g1', 'server');

    expect(api.syncGame).not.toHaveBeenCalled();
    expect(store.loadSave('g1')).toMatchObject({
      events: more,
      sync: { dirty: false, serverVersion: 6, syncedUpTo: 2 },
    });
    expect(sync.getStatus()).toBe('synced');
  });
});

describe('sync.reconcile', () => {
  it('pushes local changes instead of downloading the server copy', async () => {
    kingdom('g1');
    api.syncGame.mockResolvedValue(summary);
    api.listGames.mockResolvedValue([{ ...summary, version: 5, eventCount: 3 }]);

    await sync.reconcile('u1');

    expect(api.syncGame).toHaveBeenCalledOnce();
    // Pushed, then the newer server copy (version 5) is downloaded.
    expect(api.exportGame).toHaveBeenCalledOnce();
  });

  it('downloads the kingdoms of the account', async () => {
    const replaced = vi.fn();
    const unsubscribe = sync.subscribeSaveReplaced(replaced);
    api.listGames.mockResolvedValue([{ ...summary, id: 'g2', name: 'Camelot' }]);
    api.exportGame.mockResolvedValue({
      id: 'g2',
      name: 'Camelot',
      events,
      cardNames: { 2: 'Daisy' },
      savedAt: 0,
      checkpoint: { seq: 1, state: { round: 1 } },
    });

    await sync.reconcile('u1');
    unsubscribe();

    expect(store.loadSave('g2')).toMatchObject({
      cardNames: { 2: 'Daisy' },
      sync: { dirty: false, userId: 'u1', serverVersion: 4 },
      checkpoint: { seq: 1, state: { round: 1 } },
    });
    expect(store.get('g2')).toMatchObject({ name: 'Camelot', summary: { score: 7 } });
    expect(replaced).toHaveBeenCalledWith('g2');
    expect(sync.getStatus()).toBe('synced');
  });

  it('keeps an up-to-date local kingdom and follows a rename', async () => {
    kingdom('g1', 'Old name');
    markSynced('g1');
    api.listGames.mockResolvedValue([summary]);

    await sync.reconcile('u1');

    expect(api.exportGame).not.toHaveBeenCalled();
    expect(store.get('g1')?.name).toBe('Avalon');
  });

  it('creates on the server a kingdom played without an account, once signed up', async () => {
    kingdom('g1');
    api.syncGame.mockResolvedValue(summary);
    api.listGames.mockResolvedValue([summary]);

    await sync.reconcile('u1');

    expect(api.syncGame).toHaveBeenCalledWith(
      'g1',
      expect.objectContaining({ events, fromSeq: 0, name: 'Avalon' }),
    );
    expect(store.loadSave('g1')?.sync).toMatchObject({
      dirty: false,
      userId: 'u1',
      serverVersion: 4,
    });
    expect(sync.getStatus()).toBe('synced');
  });

  it('removes the kingdoms of another account', async () => {
    kingdom('g1');
    markSynced('g1', 'other');

    await sync.reconcile('u1');

    expect(store.list()).toEqual([]);
  });

  it('removes the kingdoms synced with an account after sign-out, keeps local ones', () => {
    kingdom('g1');
    markSynced('g1');
    kingdom('g2', 'Camelot');

    sync.forgetAccountKingdoms();

    expect(store.list().map(k => k.id)).toEqual(['g2']);
  });

  it('removes synced kingdoms the server no longer has', async () => {
    kingdom('g1');
    markSynced('g1');

    await sync.reconcile('u1');

    expect(store.get('g1')).toBeNull();
  });

  it('retries kingdoms refused by the limit (the account may have changed)', async () => {
    kingdom('g1');
    store.updateSyncInfo('g1', store.loadSave('g1')?.savedAt ?? 0, { dirty: true, limited: true });
    api.syncGame.mockResolvedValue(summary);
    api.listGames.mockResolvedValue([summary]);

    await sync.reconcile('u1');

    expect(api.syncGame).toHaveBeenCalledOnce();
  });

  it('keeps the local kingdoms when offline', async () => {
    kingdom('g1');
    markSynced('g1');
    api.listGames.mockRejectedValue(new ApiError(0, null));

    await sync.reconcile('u1');

    expect(store.get('g1')).not.toBeNull();
    expect(sync.getStatus()).toBe('offline');
  });
});
