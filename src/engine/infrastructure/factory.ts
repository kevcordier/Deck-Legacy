/**
 * @file infrastructure/factory.ts
 * Création des instances de carte et utilitaires de génération d'UIDs.
 *
 * Couche : Infrastructure — dépend uniquement du domaine.
 */

import type { CardDef, CardInstance } from '@engine/domain/types';

/** Entrée du deck de départ (id unique + cardId), issue de `deck.json`. */
export type DeckEntry = { id: number; cardId: number };

let uidCounter = 0;

/**
 * Génère un UID unique pour une instance de carte.
 * Format : `c{cardId}s{stateId}_{counter}_{random3chars}`
 * Le compteur est global à la session ; `resetUidCounter` le remet à 0 avant chaque nouvelle partie.
 */
export function generateUid(cardId: number, stateId: number): string {
  return `c${cardId}s${stateId}_${++uidCounter}_${Math.random().toString(36).slice(2, 5)}`;
}

/** Remet le compteur d'UID à zéro. Appelé au démarrage d'une nouvelle partie pour des UIDs prévisibles. */
export function resetUidCounter(): void {
  uidCounter = 0;
}

/**
 * Crée une nouvelle instance de carte dans son état initial.
 * `deckEntryId` est à 0 par défaut : les appelants le surchargent via object spread.
 */
export function createInstance(
  cardId: number,
  stateId: number,
  defs: Record<number, CardDef>,
): CardInstance {
  const def = defs[cardId];
  if (!def) throw new Error(`Card def not found: ${cardId}`);
  const state = def.states.find(s => s.id === stateId);
  if (!state) throw new Error(`State ${stateId} not found on card ${cardId}`);
  return {
    id: generateUid(cardId, stateId),
    cardId,
    stateId,
    deckEntryId: 0,
    stickers: {},
    trackProgress: null,
  };
}

/** Mélange un tableau en place (algorithme Fisher-Yates). Retourne une copie mélangée. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
