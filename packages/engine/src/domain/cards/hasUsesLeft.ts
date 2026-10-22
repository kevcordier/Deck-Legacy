import type { CardAction, CardInstance, GameState } from '../types';
import { turnUseKey } from './turnUseKey';

/** The action is below its use limits: `limitedTime` (whole game) and `perTurn` (this turn). */
export function hasUsesLeft(
  action: CardAction,
  instance: CardInstance,
  gameState: GameState,
): boolean {
  if (
    action.limitedTime !== undefined &&
    instance.usedActionIds.filter(id => id === action.id).length >= action.limitedTime
  ) {
    return false;
  }
  if (action.perTurn !== undefined) {
    const key = turnUseKey(instance.id, action.id);
    const uses = (gameState.turnUsedActions ?? []).filter(used => used === key).length;
    if (uses >= action.perTurn) return false;
  }
  return true;
}
