/**
 * @file infrastructure/factory.ts
 *
 * Layer: Infrastructure — depends only on the domain.
 */
import type { CardDef, CardInstance } from '@engine/domain/types';

/**
 * Creates a new card instance in its initial state.
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
    trackProgress: [],
  };
}
