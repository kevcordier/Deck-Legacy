import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveGame, loadSave, deleteSave, hasSave, formatSaveDate } from '@engine/persistence';
import type { GameState } from '@engine/types';
import { EMPTY_STATE } from '@engine/reducer';

// ─── localStorage mock ────────────────────────────────────────────────────────

const store: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    for (const k in store) delete store[k];
  }),
};

vi.stubGlobal('localStorage', localStorageMock);

const SAVE_KEY = 'deck_legacy_save';

const mockState: GameState = {
  ...EMPTY_STATE,
  round: 3,
  turn: 2,
};

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// ─── saveGame ─────────────────────────────────────────────────────────────────

describe('saveGame', () => {
  it('writes to localStorage under SAVE_KEY', () => {
    saveGame([], mockState);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(SAVE_KEY, expect.any(String));
  });

  it('serialises round and turn', () => {
    saveGame([], mockState);
    const raw = store[SAVE_KEY];
    const parsed = JSON.parse(raw);
    expect(parsed.round).toBe(3);
    expect(parsed.turn).toBe(2);
  });

  it('includes savedAt timestamp', () => {
    const before = Date.now();
    saveGame([], mockState);
    const after = Date.now();
    const parsed = JSON.parse(store[SAVE_KEY]);
    expect(parsed.savedAt).toBeGreaterThanOrEqual(before);
    expect(parsed.savedAt).toBeLessThanOrEqual(after);
  });

  it('serialises the events array', () => {
    const events = [{ type: 'ROUND_ENDED', payload: { round: 1 } }] as Parameters<
      typeof saveGame
    >[0];
    saveGame(events, mockState);
    const parsed = JSON.parse(store[SAVE_KEY]);
    expect(parsed.events).toHaveLength(1);
  });
});

// ─── loadSave ─────────────────────────────────────────────────────────────────

describe('loadSave', () => {
  it('returns null when nothing is saved', () => {
    expect(loadSave()).toBeNull();
  });

  it('returns parsed save data', () => {
    saveGame([], mockState);
    const save = loadSave();
    expect(save).not.toBeNull();
    expect(save?.round).toBe(3);
    expect(save?.turn).toBe(2);
  });

  it('returns null when localStorage contains invalid JSON', () => {
    store[SAVE_KEY] = 'not-valid-json{{{';
    expect(loadSave()).toBeNull();
  });
});

// ─── deleteSave ───────────────────────────────────────────────────────────────

describe('deleteSave', () => {
  it('removes the save from localStorage', () => {
    saveGame([], mockState);
    expect(hasSave()).toBe(true);
    deleteSave();
    expect(hasSave()).toBe(false);
  });

  it('does not throw when nothing is saved', () => {
    expect(() => deleteSave()).not.toThrow();
  });
});

// ─── hasSave ──────────────────────────────────────────────────────────────────

describe('hasSave', () => {
  it('returns false when no save exists', () => {
    expect(hasSave()).toBe(false);
  });

  it('returns true after a save', () => {
    saveGame([], mockState);
    expect(hasSave()).toBe(true);
  });
});

// ─── formatSaveDate ───────────────────────────────────────────────────────────

describe('formatSaveDate', () => {
  it('returns a non-empty string', () => {
    const result = formatSaveDate(Date.now());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formats a known timestamp correctly (fr-FR style)', () => {
    // 2024-01-15 10:30 UTC
    const ts = new Date('2024-01-15T10:30:00').getTime();
    const result = formatSaveDate(ts);
    expect(result).toMatch(/15/); // day
    expect(result).toMatch(/01/); // month
    expect(result).toMatch(/2024/); // year
  });
});
