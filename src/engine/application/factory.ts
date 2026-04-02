/**
 * @file infrastructure/factory.ts
 *
 * Couche : Infrastructure — dépend uniquement du domaine.
 */

import type { CardDef, CardInstance } from '@engine/domain/types';

/**
 * Crée une nouvelle instance de carte dans son état initial.
 */
export function createInstance(
  id: number,
  cardId: number,
  stateId: number,
  defs: Record<number, CardDef>,
): CardInstance {
  const def = defs[cardId];
  if (!def) throw new Error(`Card def not found: ${cardId}`);
  const state = def.states.find(s => s.id === stateId);
  if (!state) throw new Error(`State ${stateId} not found on card ${cardId}`);
  return {
    id,
    cardId,
    stateId,
    stickers: {},
    trackProgress: null,
  };
}
