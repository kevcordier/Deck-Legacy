import { memory, memoryStorage } from '../../memoryStorage';
import { EMPTY_SUMMARY } from '@domain/kingdom/emptySummary';
import { LocalKingdomStore } from '@infrastructure/storage/LocalKingdomStore';
import { parseSave } from '@infrastructure/storage/parseSave';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const events = [{ id: 'e1', type: 'gameStarted', timestamp: 1 }] as never[];
const summary = { score: 12, segments: [{ segment: 'base', score: 12 }], finished: true };

let store: LocalKingdomStore;

beforeEach(() => {
  memory.clear();
  store = new LocalKingdomStore(memoryStorage);
});

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
    store.create('k1', 'Avalon');
    store.create('k2', 'Camelot');

    expect(store.list().map(k => k.name)).toEqual(['Camelot', 'Avalon']);
    expect(store.get('k1')?.summary).toEqual(EMPTY_SUMMARY);

    store.saveGame('k1', events, {}, summary);
    store.delete('k1');

    expect(store.get('k1')).toBeNull();
    expect(store.loadSave('k1')).toBeNull();
  });

  it('notifies listeners and keeps a stable snapshot between changes', () => {
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.create('k1', 'Avalon');
    expect(listener).toHaveBeenCalledOnce();
    expect(store.list()).toBe(store.list());

    unsubscribe();
    store.create('k2', 'Camelot');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('ignores corrupted index entries', () => {
    memory.set(
      'deck_legacy_kingdoms',
      JSON.stringify([
        { id: 'k1', summary: { segments: [{ segment: 'base', score: 3 }, { segment: 4 }] } },
        { id: 'k3', summary: { round: 4, turn: 'x' } },
        42,
      ]),
    );
    store.upsert({ id: 'k2', name: 'B', createdAt: 0, summary: EMPTY_SUMMARY });

    expect(store.get('k1')).toEqual({
      id: 'k1',
      name: '',
      createdAt: 0,
      summary: { score: 0, segments: [{ segment: 'base', score: 3 }], finished: false },
    });
    expect(store.get('k3')?.summary).toEqual({ ...EMPTY_SUMMARY, round: 4 });
  });

  it('reads an unreadable index as empty', () => {
    memory.set('deck_legacy_kingdoms', '{broken');
    store.upsert({ id: 'k1', name: 'A', createdAt: 0, summary: EMPTY_SUMMARY });

    expect(store.list().map(k => k.id)).toEqual(['k1']);
  });

  it('hydrates the saves of the indexed kingdoms', async () => {
    store.create('k1', 'Avalon');
    await expect(store.hydrateSaves()).resolves.toBeUndefined();
  });

  it('abandons a kingdom on the server at the next sync', () => {
    store.create('k1', 'Avalon');

    store.abandon('k1');
    store.abandon('k1');

    expect(store.get('k1')).toBeNull();
    expect(store.getPendingAbandons()).toEqual(['k1']);
  });
});

describe('store.rename', () => {
  it('renames a kingdom and marks its save dirty', () => {
    store.create('k1', 'Avalon');
    store.saveGame('k1', events, {}, EMPTY_SUMMARY);
    const before = store.loadSave('k1');
    store.updateSyncInfo('k1', before?.savedAt ?? 0, {
      dirty: false,
      userId: 'u1',
      serverVersion: 1,
    });

    store.rename('k1', 'Camelot');

    expect(store.get('k1')?.name).toBe('Camelot');
    expect(store.loadSave('k1')?.sync).toEqual({ dirty: true, userId: 'u1', serverVersion: 1 });
    expect(store.loadSave('k1')?.savedAt).toBeGreaterThan(before?.savedAt ?? 0);
  });

  it('renames a kingdom without a save and ignores unknown ones', () => {
    store.create('k1', 'Avalon');

    store.rename('k1', 'Camelot');
    store.rename('missing', 'Nowhere');

    expect(store.get('k1')?.name).toBe('Camelot');
    expect(store.loadSave('k1')).toBeNull();
    expect(store.get('missing')).toBeNull();
  });
});

describe('saves', () => {
  it('marks every save as dirty, keeps the account and updates the summary', () => {
    store.create('k1', 'Avalon');
    store.saveGame('k1', events, {}, EMPTY_SUMMARY);
    store.updateSyncInfo('k1', store.loadSave('k1')?.savedAt ?? 0, {
      dirty: false,
      userId: 'u1',
      serverVersion: 1,
    });

    store.saveGame('k1', events, { 1: 'Bessie' }, summary);

    expect(store.loadSave('k1')?.sync).toEqual({ dirty: true, userId: 'u1', serverVersion: 1 });
    expect(store.get('k1')?.summary).toEqual(summary);
  });

  it('keeps the checkpoint while the events it covers are unchanged', () => {
    const checkpoint = { seq: 1, state: { round: 1 } as never };
    const later = [...events, { id: 'e2' }] as never[];
    store.writeSave({
      id: 'k1',
      events,
      cardNames: {},
      savedAt: 0,
      sync: { dirty: false },
      checkpoint,
    });

    store.saveGame('k1', later, {}, EMPTY_SUMMARY);
    expect(store.loadSave('k1')?.checkpoint).toEqual(checkpoint);

    // A development rewind before the checkpoint, then another move.
    store.saveGame('k1', [{ id: 'e9' }] as never[], {}, EMPTY_SUMMARY);
    expect(store.loadSave('k1')?.checkpoint).toBeUndefined();
  });

  it('drops an unreadable checkpoint', () => {
    expect(parseSave({ id: 'k1', events, checkpoint: { seq: '1' } })?.checkpoint).toBeUndefined();
  });

  it('ignores sync results for a save that changed meanwhile', () => {
    store.saveGame('k1', events, {}, EMPTY_SUMMARY);

    store.updateSyncInfo('k1', -1, { dirty: false });

    expect(store.loadSave('k1')?.sync.dirty).toBe(true);
  });

  it('returns null for an unreadable stored save', () => {
    memory.set('deck_legacy_save_k1', '{broken');
    expect(store.loadSave('k1')).toBeNull();
  });
});

describe('store.migrateLegacySave', () => {
  it('turns the single save of older versions into a kingdom', () => {
    memory.set('deck_legacy_save', JSON.stringify({ id: 'g1', events, savedAt: 7 }));

    const save = store.migrateLegacySave('My kingdom');

    expect(save?.id).toBe('g1');
    expect(memory.has('deck_legacy_save')).toBe(false);
    expect(store.loadSave('g1')?.sync.dirty).toBe(true);
    expect(store.get('g1')).toMatchObject({ name: 'My kingdom', createdAt: 7 });
  });

  it('does nothing without an old save, and drops an unreadable one', () => {
    expect(store.migrateLegacySave('My kingdom')).toBeNull();

    memory.set('deck_legacy_save', '{broken');
    expect(store.migrateLegacySave('My kingdom')).toBeNull();
    expect(memory.has('deck_legacy_save')).toBe(false);
    expect(store.list()).toEqual([]);
  });
});

describe('pending abandons', () => {
  it('stores and clears ids', () => {
    expect(store.getPendingAbandons()).toEqual([]);
    store.setPendingAbandons(['g1', 'g2']);
    expect(store.getPendingAbandons()).toEqual(['g1', 'g2']);
    store.setPendingAbandons([]);
    expect(memory.has('deck_legacy_pending_abandons')).toBe(false);
  });

  it('ignores corrupted values', () => {
    memory.set('deck_legacy_pending_abandons', '{');
    expect(store.getPendingAbandons()).toEqual([]);
    memory.set('deck_legacy_pending_abandons', '[1,"g1"]');
    expect(store.getPendingAbandons()).toEqual(['g1']);
  });
});

describe('store.loadSave cache', () => {
  it('parses a save once per stored version', () => {
    store.create('g1', 'Avalon');
    store.saveGame('g1', [], {}, EMPTY_SUMMARY);

    const first = store.loadSave('g1');
    expect(store.loadSave('g1')).toBe(first);

    store.saveGame('g1', [{ id: 'e1' }] as never[], {}, EMPTY_SUMMARY);
    expect(store.loadSave('g1')).not.toBe(first);
    expect(store.loadSave('g1')?.events).toHaveLength(1);
  });
});
