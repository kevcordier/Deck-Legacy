/**
 * @file infrastructure/persistence.ts
 * Save and load game state from `localStorage`.
 *
 * The save stores the full list of events (`GameEvent[]`), which allows
 * the exact state to be reconstructed via `replayEvents` on reload.
 * `pendingChoice` is also saved because it is not part of the event log.
 *
 * localStorage key: `deck_legacy_save`
 * Layer: Infrastructure — depends only on the domain.
 */
import type { GameEvent } from '@engine/domain/types';

const SAVE_KEY = 'deck_legacy_save';

export type SaveData = {
  id: string;
  events: GameEvent[];
  cardNames: Record<number, string>;
  savedAt: number; // timestamp ms
};

export type SaveImportError = 'invalid_json' | 'invalid_schema';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeCardNames(value: unknown): Record<number, string> | null {
  if (value === undefined) return {};
  if (!isRecord(value)) return null;

  const cardNames: Record<number, string> = {};
  for (const [instanceId, chosenName] of Object.entries(value)) {
    if (typeof chosenName !== 'string') {
      return null;
    }

    const parsedId = Number(instanceId);
    if (!Number.isInteger(parsedId)) {
      return null;
    }

    cardNames[parsedId] = chosenName;
  }

  return cardNames;
}

function normalizeSaveData(value: unknown): SaveData | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, events, cardNames: rawCardNames, savedAt } = value;
  if (typeof id !== 'string' || !Array.isArray(events)) {
    return null;
  }

  const cardNames = normalizeCardNames(rawCardNames);
  if (!cardNames) {
    return null;
  }

  if (savedAt !== undefined && (typeof savedAt !== 'number' || !Number.isFinite(savedAt))) {
    return null;
  }

  return {
    id,
    events: events as GameEvent[],
    cardNames,
    savedAt: typeof savedAt === 'number' ? savedAt : Date.now(),
  };
}

function readSaveData(): SaveData | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    return normalizeSaveData(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function exportSaveDataAsJson(): string | null {
  const saveData = readSaveData();
  if (!saveData) {
    return null;
  }

  return JSON.stringify(saveData, null, 2);
}

export function importSaveDataFromJson(rawJson: string): SaveImportError | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return 'invalid_json';
  }

  const saveData = normalizeSaveData(parsed);
  if (!saveData) {
    return 'invalid_schema';
  }

  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  return null;
}

/**
 * Saves the current game to `localStorage`.
 * Only called when `pendingChoice === null` (game is in a stable state).
 */
export function saveGame(id: string, events: GameEvent[]): void {
  try {
    const existingSave = readSaveData();
    const cardNames = existingSave?.id === id ? existingSave.cardNames : {};

    const data: SaveData = {
      id,
      events,
      cardNames,
      savedAt: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Unable to save game', e);
  }
}

/** Loads the save from `localStorage`. Returns `null` if missing or corrupted. */
export function loadSave(): SaveData | null {
  try {
    return readSaveData();
  } catch {
    return null;
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function setCardName(instanceId: number, chosenName: string): void {
  try {
    const existingSave = readSaveData();
    if (!existingSave) return;

    const cardNames = { ...existingSave.cardNames };
    cardNames[instanceId] = chosenName;

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...existingSave,
        cardNames,
        savedAt: Date.now(),
      } satisfies SaveData),
    );
  } catch (e) {
    console.warn('Unable to save name', e);
  }
}

export function getCardName(instanceId: number): string | undefined {
  try {
    return readSaveData()?.cardNames[instanceId];
  } catch (e) {
    console.warn('Unable to load name', e);
    return undefined;
  }
}
