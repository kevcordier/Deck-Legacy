import { memory, storageMock } from './memoryStorage';
import type * as ApiModule from '@services/api';
import { ApiError } from '@services/api';
import {
  EMPTY_SUMMARY,
  createKingdom,
  getKingdom,
  getPendingAbandons,
  listKingdoms,
  loadSave,
  saveGame,
  setPendingAbandons,
  updateSyncInfo,
} from '@services/persistence';
import {
  getSyncStatus,
  reconcile,
  resolveConflict,
  setSyncUser,
  subscribeSaveReplaced,
  syncNow,
} from '@services/sync';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@services/storage', () => storageMock);
vi.mock('@services/config', () => ({ config: { apiUrl: 'http://api.test' } }));

const api = vi.hoisted(() => ({
  listGames: vi.fn(),
  syncGame: vi.fn(),
  exportGame: vi.fn(),
  abandonGame: vi.fn(),
}));
vi.mock('@services/api', async importOriginal => {
  const actual: typeof ApiModule = await importOriginal();
  return { ...actual, api };
});

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
  createKingdom(id, name);
  saveGame(id, events, {}, EMPTY_SUMMARY);
}

function markSynced(id: string, userId = 'u1', serverVersion = 4) {
  updateSyncInfo(id, loadSave(id)?.savedAt ?? 0, { dirty: false, userId, serverVersion });
}

beforeEach(() => {
  memory.clear();
  for (const fn of Object.values(api)) fn.mockReset();
  api.listGames.mockResolvedValue([]);
  setSyncUser('u1');
});

afterEach(() => setSyncUser(null));

describe('syncNow', () => {
  it('does nothing without a session', async () => {
    setSyncUser(null);
    kingdom('g1');

    await syncNow();

    expect(api.syncGame).not.toHaveBeenCalled();
    expect(getSyncStatus()).toBe('signedOut');
  });

  it('pushes every dirty kingdom with its name and records the server version', async () => {
    kingdom('g1');
    kingdom('g2', 'Camelot');
    markSynced('g2');
    api.syncGame.mockResolvedValue(summary);

    await syncNow();

    expect(api.syncGame).toHaveBeenCalledOnce();
    expect(api.syncGame).toHaveBeenCalledWith('g1', {
      events,
      fromSeq: 0,
      cardNames: {},
      name: 'Avalon',
    });
    expect(loadSave('g1')?.sync).toEqual({
      dirty: false,
      userId: 'u1',
      serverVersion: 4,
      syncedUpTo: 1,
    });
    expect(getSyncStatus()).toBe('synced');
  });

  it('marks a save as rejected when the server cannot replay it', async () => {
    kingdom('g1');
    api.syncGame.mockRejectedValue(new ApiError(422, null));

    await syncNow();
    expect(getSyncStatus()).toBe('rejected');

    await syncNow();
    expect(api.syncGame).toHaveBeenCalledOnce();
  });

  it('keeps a kingdom local when the server limit is reached', async () => {
    kingdom('g1');
    api.syncGame.mockRejectedValue(
      new ApiError(409, { statusCode: 409, code: 'KINGDOM_LIMIT', message: '' }),
    );

    await syncNow();

    expect(loadSave('g1')?.sync.limited).toBe(true);
    expect(getSyncStatus()).toBe('limited');
  });

  it('skips saves synced with another account', async () => {
    kingdom('g1');
    updateSyncInfo('g1', loadSave('g1')?.savedAt ?? 0, { dirty: true, userId: 'other' });

    await syncNow();

    expect(api.syncGame).not.toHaveBeenCalled();
    expect(getSyncStatus()).toBe('pending');
  });

  it('reports offline on network errors and keeps the save dirty', async () => {
    kingdom('g1');
    api.syncGame.mockRejectedValue(new ApiError(0, null));

    await syncNow();

    expect(getSyncStatus()).toBe('offline');
    expect(loadSave('g1')?.sync.dirty).toBe(true);
  });

  it('abandons deleted kingdoms, keeping failures for later', async () => {
    setPendingAbandons(['gone', 'unknown', 'later']);
    api.abandonGame.mockImplementation(async (id: string) => {
      if (id === 'unknown') throw new ApiError(404, null);
      if (id === 'later') throw new ApiError(0, null);
    });

    await syncNow();

    expect(api.abandonGame).toHaveBeenCalledTimes(3);
    expect(getPendingAbandons()).toEqual(['later']);
    expect(getSyncStatus()).toBe('offline');
  });
});

describe('delta sync', () => {
  const more = [...events, { id: 'e2', type: 'cardProduced', timestamp: 2 }] as never[];

  it('pushes only the events the server lacks, built on its version', async () => {
    kingdom('g1');
    api.syncGame.mockResolvedValue(summary);
    await syncNow();
    saveGame('g1', more, {}, EMPTY_SUMMARY);
    api.syncGame.mockResolvedValue({ ...summary, version: 5 });

    await syncNow();

    expect(api.syncGame).toHaveBeenLastCalledWith('g1', {
      events: more.slice(1),
      fromSeq: 1,
      baseVersion: 4,
      cardNames: {},
      name: 'Avalon',
    });
    expect(loadSave('g1')?.sync).toMatchObject({ serverVersion: 5, syncedUpTo: 2 });
  });

  it('resends the events changed by a rewind', async () => {
    kingdom('g1');
    saveGame('g1', more, {}, EMPTY_SUMMARY);
    markSynced('g1');
    updateSyncInfo('g1', loadSave('g1')?.savedAt ?? 0, {
      ...(loadSave('g1')?.sync ?? { dirty: false }),
      syncedUpTo: 2,
    });
    saveGame('g1', events, {}, EMPTY_SUMMARY);
    saveGame('g1', [...events, { id: 'e3' }] as never[], {}, EMPTY_SUMMARY);

    expect(loadSave('g1')?.sync.syncedUpTo).toBe(1);
  });

  it('keeps the new server version when the player played during the push', async () => {
    kingdom('g1');
    api.syncGame.mockImplementation(async () => {
      saveGame('g1', more, {}, EMPTY_SUMMARY);
      return summary;
    });

    await syncNow();

    expect(loadSave('g1')?.sync).toEqual({
      dirty: true,
      userId: 'u1',
      serverVersion: 4,
      syncedUpTo: 1,
    });
  });

  it('flags a conflict when another device synced first, until the player chooses', async () => {
    kingdom('g1');
    markSynced('g1');
    saveGame('g1', more, {}, EMPTY_SUMMARY);
    api.syncGame.mockRejectedValue(
      new ApiError(409, { statusCode: 409, code: 'STALE_VERSION', message: '' }),
    );

    await syncNow();
    expect(getSyncStatus()).toBe('conflict');
    saveGame('g1', [...more, { id: 'e3' }] as never[], {}, EMPTY_SUMMARY);
    await syncNow();
    expect(api.syncGame).toHaveBeenCalledOnce();
    expect(loadSave('g1')?.sync.conflict).toBe(true);
  });

  it('overwrites the server with the whole local game when the player keeps theirs', async () => {
    kingdom('g1');
    updateSyncInfo('g1', loadSave('g1')?.savedAt ?? 0, {
      dirty: true,
      userId: 'u1',
      serverVersion: 4,
      syncedUpTo: 1,
      conflict: true,
    });
    api.syncGame.mockResolvedValue({ ...summary, version: 6 });

    await resolveConflict('g1', 'mine');

    expect(api.syncGame).toHaveBeenCalledWith('g1', {
      events,
      fromSeq: 0,
      cardNames: {},
      name: 'Avalon',
    });
    expect(getSyncStatus()).toBe('synced');
  });

  it('downloads the server version when the player keeps it', async () => {
    kingdom('g1');
    updateSyncInfo('g1', loadSave('g1')?.savedAt ?? 0, {
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

    await resolveConflict('g1', 'server');

    expect(api.syncGame).not.toHaveBeenCalled();
    expect(loadSave('g1')).toMatchObject({
      events: more,
      sync: { dirty: false, serverVersion: 6, syncedUpTo: 2 },
    });
    expect(getSyncStatus()).toBe('synced');
  });
});

describe('reconcile', () => {
  it('pushes local changes instead of downloading the server copy', async () => {
    kingdom('g1');
    api.syncGame.mockResolvedValue(summary);
    api.listGames.mockResolvedValue([{ ...summary, version: 5, eventCount: 3 }]);

    await reconcile('u1');

    expect(api.syncGame).toHaveBeenCalledOnce();
    // Pushed, then the newer server copy (version 5) is downloaded.
    expect(api.exportGame).toHaveBeenCalledOnce();
  });

  it('downloads the kingdoms of the account', async () => {
    const replaced = vi.fn();
    const unsubscribe = subscribeSaveReplaced(replaced);
    api.listGames.mockResolvedValue([{ ...summary, id: 'g2', name: 'Camelot' }]);
    api.exportGame.mockResolvedValue({
      id: 'g2',
      name: 'Camelot',
      events,
      cardNames: { 2: 'Daisy' },
      savedAt: 0,
    });

    await reconcile('u1');
    unsubscribe();

    expect(loadSave('g2')).toMatchObject({
      cardNames: { 2: 'Daisy' },
      sync: { dirty: false, userId: 'u1', serverVersion: 4 },
    });
    expect(getKingdom('g2')).toMatchObject({ name: 'Camelot', summary: { score: 7 } });
    expect(replaced).toHaveBeenCalledWith('g2');
    expect(getSyncStatus()).toBe('synced');
  });

  it('keeps an up-to-date local kingdom and follows a rename', async () => {
    kingdom('g1', 'Old name');
    markSynced('g1');
    api.listGames.mockResolvedValue([summary]);

    await reconcile('u1');

    expect(api.exportGame).not.toHaveBeenCalled();
    expect(getKingdom('g1')?.name).toBe('Avalon');
  });

  it('removes the kingdoms of another account', async () => {
    kingdom('g1');
    markSynced('g1', 'other');

    await reconcile('u1');

    expect(listKingdoms()).toEqual([]);
  });

  it('removes synced kingdoms the server no longer has', async () => {
    kingdom('g1');
    markSynced('g1');

    await reconcile('u1');

    expect(getKingdom('g1')).toBeNull();
  });

  it('retries kingdoms refused by the limit (the account may have changed)', async () => {
    kingdom('g1');
    updateSyncInfo('g1', loadSave('g1')?.savedAt ?? 0, { dirty: true, limited: true });
    api.syncGame.mockResolvedValue(summary);
    api.listGames.mockResolvedValue([summary]);

    await reconcile('u1');

    expect(api.syncGame).toHaveBeenCalledOnce();
  });

  it('keeps the local kingdoms when offline', async () => {
    kingdom('g1');
    markSynced('g1');
    api.listGames.mockRejectedValue(new ApiError(0, null));

    await reconcile('u1');

    expect(getKingdom('g1')).not.toBeNull();
    expect(getSyncStatus()).toBe('offline');
  });
});
