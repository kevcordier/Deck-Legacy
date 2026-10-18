import { memory, memoryStorage } from '../../memoryStorage';
import { AbandonKingdom } from '@application/kingdom/AbandonKingdom';
import { CreateKingdom } from '@application/kingdom/CreateKingdom';
import { DiscardLocalSave } from '@application/kingdom/DiscardLocalSave';
import { MigrateLegacySave } from '@application/kingdom/MigrateLegacySave';
import { RenameKingdom } from '@application/kingdom/RenameKingdom';
import { SaveGame } from '@application/kingdom/SaveGame';
import type { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { EMPTY_SUMMARY } from '@domain/kingdom/emptySummary';
import { LocalKingdomStore } from '@infrastructure/storage/LocalKingdomStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const events = [{ id: 'e1', type: 'gameStarted', timestamp: 1 }] as never[];

let store: LocalKingdomStore;
const sync = { schedule: vi.fn() };

beforeEach(() => {
  memory.clear();
  sync.schedule.mockReset();
  store = new LocalKingdomStore(memoryStorage);
});

describe('kingdom use cases', () => {
  it('creates a kingdom without a save', () => {
    const kingdom = new CreateKingdom(store, () => 'k1').execute('Avalon');

    expect(kingdom).toMatchObject({ id: 'k1', name: 'Avalon', summary: EMPTY_SUMMARY });
    expect(store.loadSave('k1')).toBeNull();
  });

  it('creates a kingdom that opens a starting save', () => {
    new CreateKingdom(store, () => 'k1').execute('Avalon', { events });

    expect(store.loadSave('k1')).toMatchObject({ id: 'k1', events, sync: { dirty: true } });
  });

  it('renames and abandons, then schedules a sync', () => {
    store.create('k1', 'Avalon');
    new RenameKingdom(store, sync).execute('k1', 'Camelot');
    expect(store.get('k1')?.name).toBe('Camelot');

    new AbandonKingdom(store, sync).execute('k1');
    expect(store.get('k1')).toBeNull();
    expect(store.getPendingAbandons()).toEqual(['k1']);
    expect(sync.schedule).toHaveBeenCalledTimes(2);
  });

  it('saves the game with its summary, then schedules a sync', () => {
    store.create('k1', 'Avalon');
    const session = {
      id: 'k1',
      getEvents: () => events,
      getCardNames: () => ({}),
      getState: () => ({ phase: Phase.PLAYING, round: 2, turn: 3 }),
      getScore: () => 5,
      getCampaignSegments: () => [],
    } as unknown as GameSession;

    new SaveGame(store, sync).execute(session);

    expect(store.loadSave('k1')?.events).toEqual(events);
    expect(store.get('k1')?.summary).toMatchObject({ score: 5, round: 2, turn: 3 });
    expect(sync.schedule).toHaveBeenCalledOnce();
  });

  it('discards the local save only', () => {
    store.create('k1', 'Avalon');
    new DiscardLocalSave(store).execute('k1');

    expect(store.get('k1')).toBeNull();
    expect(store.getPendingAbandons()).toEqual([]);
  });

  it('keeps an empty summary when the legacy save cannot be replayed', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    memory.set('deck_legacy_save', JSON.stringify({ id: 'g1', events, savedAt: 7 }));

    new MigrateLegacySave(store, { cards: {}, stickers: {} } as never).execute('My kingdom');

    expect(store.get('g1')).toMatchObject({ name: 'My kingdom', summary: EMPTY_SUMMARY });
  });
});
