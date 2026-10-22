import type { CardDef, GameState, Passive } from '../../types';
import { getActiveState } from './getActiveState';

/** The passives a card in play gives: none for an equipment until it is equipped. */
export function getActivePassives(
  gameState: GameState,
  instanceId: number,
  cardDefs: Record<number, CardDef>,
): Passive[] {
  const instance = gameState.instances[instanceId];
  if (!instance) return [];
  const state = getActiveState(instance, cardDefs);
  if (state.equip && gameState.equipped?.[instanceId] === undefined) return [];
  return state.passives ?? [];
}
