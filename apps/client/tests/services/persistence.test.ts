import { memory, storageMock } from './memoryStorage';
import {
  EMPTY_SUMMARY,
  abandonKingdom,
  createKingdom,
  deleteKingdom,
  getKingdom,
  getPendingAbandons,
  hydrateSaves,
  listKingdoms,
  loadSave,
  migrateLegacySave,
  parseSave,
  saveGame,
  setPendingAbandons,
  subscribeKingdoms,
  updateSyncInfo,
  upsertKingdom,
} from '@services/persistence';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@services/storage', () => storageMock);

const events = [{ id: 'e1', type: 'gameStarted', timestamp: 1 }] as never[];
const summary = { score: 12, segments: [{ segment: 'base', score: 12 }], finished: true };

beforeEach(() => memory.clear());

describe('parseSave', () => {
  it('rejects invalid saves', () => {
    expect(parseSave(null)).toBeNull();
    expect(parseSave({ events: [] })).toBeNull();
    expect(parseSave({ id: 'g1', events: 'nope' })).toBeNull();
  });

  it('reads saves of the former offline version as not synced', () => {
    expect(parseSave({ id: 'g1', events, cardNames: { 3: 'Bessie', 4: 12 }, savedAt: 5 })).toEqual({
      id: 'g1',
      events,
      cardNames: { '3': 'Bessie' },
      savedAt: 5,
      sync: { dirty: true },
    });
  });

  it('keeps the sync information', () => {
    const save = parseSave({
      id: 'g1',
      events,
      sync: {
        dirty: false,
        userId: 'u1',
        serverVersion: 3,
        rejected: true,
        limited: true,
        syncedUpTo: 4,
        conflict: true,
      },
    });

    expect(save?.sync).toEqual({
      dirty: false,
      userId: 'u1',
      serverVersion: 3,
      rejected: true,
      limited: true,
      syncedUpTo: 4,
      conflict: true,
    });
  });
});

describe('kingdoms', () => {
  it('creates, lists (newest first) and deletes kingdoms', () => {
    vi.spyOn(Date, 'now').mockReturnValueOnce(1).mockReturnValueOnce(2);
    createKingdom('k1', 'Avalon');
    createKingdom('k2', 'Camelot');

    expect(listKingdoms().map(k => k.name)).toEqual(['Camelot', 'Avalon']);
    expect(getKingdom('k1')?.summary).toEqual(EMPTY_SUMMARY);

    saveGame('k1', events, {}, summary);
    deleteKingdom('k1');

    expect(getKingdom('k1')).toBeNull();
    expect(loadSave('k1')).toBeNull();
  });

  it('notifies listeners and keeps a stable snapshot between changes', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeKingdoms(listener);

    createKingdom('k1', 'Avalon');
    expect(listener).toHaveBeenCalledOnce();
    expect(listKingdoms()).toBe(listKingdoms());

    unsubscribe();
    createKingdom('k2', 'Camelot');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('ignores corrupted index entries', () => {
    memory.set(
      'deck_legacy_kingdoms',
      JSON.stringify([
        { id: 'k1', summary: { segments: [{ segment: 'base', score: 3 }, { segment: 4 }] } },
        42,
      ]),
    );
    upsertKingdom({ id: 'k2', name: 'B', createdAt: 0, summary: EMPTY_SUMMARY });

    expect(getKingdom('k1')).toEqual({
      id: 'k1',
      name: '',
      createdAt: 0,
      summary: { score: 0, segments: [{ segment: 'base', score: 3 }], finished: false },
    });
  });

  it('reads an unreadable index as empty', () => {
    memory.set('deck_legacy_kingdoms', '{broken');
    upsertKingdom({ id: 'k1', name: 'A', createdAt: 0, summary: EMPTY_SUMMARY });

    expect(listKingdoms().map(k => k.id)).toEqual(['k1']);
  });

  it('hydrates the saves of the indexed kingdoms', async () => {
    createKingdom('k1', 'Avalon');
    await expect(hydrateSaves()).resolves.toBeUndefined();
  });

  it('abandons a kingdom on the server at the next sync', () => {
    createKingdom('k1', 'Avalon');

    abandonKingdom('k1');
    abandonKingdom('k1');

    expect(getKingdom('k1')).toBeNull();
    expect(getPendingAbandons()).toEqual(['k1']);
  });
});

describe('saves', () => {
  it('marks every save as dirty, keeps the account and updates the summary', () => {
    createKingdom('k1', 'Avalon');
    saveGame('k1', events, {}, EMPTY_SUMMARY);
    updateSyncInfo('k1', loadSave('k1')?.savedAt ?? 0, {
      dirty: false,
      userId: 'u1',
      serverVersion: 1,
    });

    saveGame('k1', events, { 1: 'Bessie' }, summary);

    expect(loadSave('k1')?.sync).toEqual({ dirty: true, userId: 'u1', serverVersion: 1 });
    expect(getKingdom('k1')?.summary).toEqual(summary);
  });

  it('ignores sync results for a save that changed meanwhile', () => {
    saveGame('k1', events, {}, EMPTY_SUMMARY);

    updateSyncInfo('k1', -1, { dirty: false });

    expect(loadSave('k1')?.sync.dirty).toBe(true);
  });

  it('returns null for an unreadable stored save', () => {
    memory.set('deck_legacy_save_k1', '{broken');
    expect(loadSave('k1')).toBeNull();
  });
});

describe('migrateLegacySave', () => {
  it('turns the single save of older versions into a kingdom', () => {
    memory.set('deck_legacy_save', JSON.stringify({ id: 'g1', events, savedAt: 7 }));

    const save = migrateLegacySave('My kingdom');

    expect(save?.id).toBe('g1');
    expect(memory.has('deck_legacy_save')).toBe(false);
    expect(loadSave('g1')?.sync.dirty).toBe(true);
    expect(getKingdom('g1')).toMatchObject({ name: 'My kingdom', createdAt: 7 });
  });

  it('does nothing without an old save, and drops an unreadable one', () => {
    expect(migrateLegacySave('My kingdom')).toBeNull();

    memory.set('deck_legacy_save', '{broken');
    expect(migrateLegacySave('My kingdom')).toBeNull();
    expect(memory.has('deck_legacy_save')).toBe(false);
    expect(listKingdoms()).toEqual([]);
  });
});

describe('pending abandons', () => {
  it('stores and clears ids', () => {
    expect(getPendingAbandons()).toEqual([]);
    setPendingAbandons(['g1', 'g2']);
    expect(getPendingAbandons()).toEqual(['g1', 'g2']);
    setPendingAbandons([]);
    expect(memory.has('deck_legacy_pending_abandons')).toBe(false);
  });

  it('ignores corrupted values', () => {
    memory.set('deck_legacy_pending_abandons', '{');
    expect(getPendingAbandons()).toEqual([]);
    memory.set('deck_legacy_pending_abandons', '[1,"g1"]');
    expect(getPendingAbandons()).toEqual(['g1']);
  });
});
