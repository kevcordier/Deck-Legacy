import { Options, Phase } from '../enums';
import { canUseOptions } from '../state/canUseOptions';
import type { CardDef, GameState, Sticker } from '../types';
import { canAffordCost } from './canAffordCost';
import { cardIsBlocked } from './cardIsBlocked';
import { getEffectiveActionCost } from './getEffectiveActionCost';
import { hasUsesLeft } from './hasUsesLeft';
import { evaluateCondition } from './selection/evaluateCondition';
import { getStateActions } from './selection/getStateActions';

/**
 * A card in play has an action that spends resources and that the player can use now (Mass
 * Export with goods at the end of the round): moving on would lose those resources.
 */
export function hasActionToSpendResources(
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): boolean {
  return [...gameState.board, ...gameState.permanents].some(id => {
    const instance = gameState.instances[id];
    if (!instance || cardIsBlocked(id, gameState)) return false;
    return getStateActions(instance, defs, stickerDefs).some(action => {
      const cost = getEffectiveActionCost(action.cost, instance);
      return (
        !action.trigger &&
        (cost.resources?.length ?? 0) > 0 &&
        // Outside the turn, only unlimited actions can still be used.
        (action.unlimited === true || gameState.phase === Phase.PLAYING) &&
        hasUsesLeft(action, instance, gameState) &&
        canUseOptions(gameState, action.endsTurn ? Options.END_TURN_ACTION : Options.ACTION, id) &&
        (!action.condition ||
          evaluateCondition(action.condition, gameState, id, defs, stickerDefs)) &&
        canAffordCost(cost, id, gameState, defs, stickerDefs)
      );
    });
  });
}
