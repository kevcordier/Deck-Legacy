import { getActiveState } from '../cards/selection/getActiveState';
import type { CardAction, CardDef, GameState } from '../types';

/** The `defeat` action of an enemy, the one a defeat effect makes it resolve. */
export function getDefeatAction(
  gameState: GameState,
  instanceId: number,
  cardDefs: Record<number, CardDef>,
): CardAction | undefined {
  const instance = gameState.instances[instanceId];
  if (!instance) return undefined;
  return getActiveState(instance, cardDefs).actions?.find(
    action => action.defeat && !action.trigger,
  );
}
