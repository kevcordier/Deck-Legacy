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

import type { GameEvent, GameState } from '@engine/domain/types';

const SAVE_KEY = 'deck_legacy_save';

export type SaveData = {
  events: GameEvent[];
  saveState: GameState;
  savedAt: number; // timestamp ms
  round: number;
  turn: number;
};

/**
 * Saves the current game to `localStorage`.
 * Only called when `pendingChoice === null` (game is in a stable state).
 */
export function saveGame(events: GameEvent[], saveState: GameState): void {
  try {
    const data: SaveData = {
      events,
      savedAt: Date.now(),
      round: saveState.round,
      turn: saveState.turn,
      saveState,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Unable to save game', e);
  }
}

/** Loads the save from `localStorage`. Returns `null` if missing or corrupted. */
export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export function deleteSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}
