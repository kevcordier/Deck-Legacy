/**
 * @file persistence.ts
 * Sauvegarde et chargement de la partie dans `localStorage`.
 *
 * La sauvegarde stocke la liste complète des événements (`GameEvent[]`), ce qui permet
 * de reconstruire l'état exact via `replayEvents` au rechargement.
 * Le `pendingChoice` est également sauvegardé car il n'est pas dans les événements.
 *
 * Clé localStorage : `deck_legacy_save`
 */

import type { GameEvent, GameState, PendingChoice } from './types';

const SAVE_KEY = 'deck_legacy_save';

export type SaveData = {
  events: GameEvent[];
  savedAt: number; // timestamp ms
  round: number;
  turn: number;
  pendingChoice?: PendingChoice | null;
};

/**
 * Sauvegarde la partie courante dans `localStorage`.
 * N'est appelé que quand `pendingChoice === null` (partie dans un état stable).
 */
export function saveGame(events: GameEvent[], state: GameState): void {
  try {
    const data: SaveData = {
      events,
      savedAt: Date.now(),
      round: state.round,
      turn: state.turn,
      pendingChoice: state.pendingChoice,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Unable to save game', e);
  }
}

/** Charge la sauvegarde depuis `localStorage`. Retourne `null` si absente ou corrompue. */
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

export function hasSave(): boolean {
  return !!localStorage.getItem(SAVE_KEY);
}

/** Formate un timestamp de sauvegarde en date lisible (format FR : JJ/MM/AAAA HH:MM). */
export function formatSaveDate(savedAt: number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(savedAt));
}
