/**
 * @file infrastructure/factory.ts
 *
 * Layer: Infrastructure — depends only on the domain.
 */
import type { CardDef, CardInstance } from './types';

/**
 * Creates a new card instance in its initial state.
 */
export function createInstance(
  id: number,
  cardId: number,
  stateId: number,
  defs: Record<number, CardDef>,
  origin?: Pick<CardInstance, 'expansion' | 'expansionId'>,
): CardInstance {
  const def = defs[cardId];
  if (!def) throw new Error(`Card def not found: ${cardId}`);
  if (!def.states.some(s => s.id === stateId))
    throw new Error(`State ${stateId} not found on card ${cardId}`);
  return {
    id,
    cardId,
    stateId,
    stickers: {},
    trackProgress: [],
    cumulated: 0,
    usedActionIds: [],
    removedResourcesByState: {},
    glories: [],
    ...origin,
  };
}
