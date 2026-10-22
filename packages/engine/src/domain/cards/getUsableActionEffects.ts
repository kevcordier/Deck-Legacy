import { ActionEffectType } from '../enums';
import { hasAnyAmountCost } from '../resources/hasAnyAmountCost';
import type {
  ActionEffect,
  CardAction,
  CardDef,
  GameState,
  Sticker,
  UsableActions,
} from '../types';
import { canAffordCost } from './canAffordCost';
import { canAffordTrackAdvanceCost } from './canAffordTrackAdvanceCost';
import { getEffectiveActionCost } from './getEffectiveActionCost';
import { hasUsesLeft } from './hasUsesLeft';
import { evaluateCondition } from './selection/evaluateCondition';
import { getStateActions } from './selection/getStateActions';

/** 'activated': ✓ / ⌛ effects (not ∞); 'timed': ⌛ effects only (Industry). */
function isUsable(action: CardAction, usable?: UsableActions): boolean {
  if (usable === 'timed') return !!action.endsTurn;
  if (usable === 'activated') return !action.unlimited;
  return true;
}

/** One USE_CARD_ACTION per activated or time effect the card can use now. */
export function getUsableActionEffects(
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  usable?: UsableActions,
): ActionEffect[] {
  const instance = gameState.instances[instanceId];
  if (!instance) return [];
  return getStateActions(instance, defs, stickerDefs)
    .filter(
      action =>
        !action.trigger &&
        isUsable(action, usable) &&
        // shortcut: an 'any' amount cost (Export) is not offered, until a used card needs it.
        !hasAnyAmountCost(action.cost) &&
        hasUsesLeft(action, instance, gameState) &&
        (!action.condition ||
          evaluateCondition(action.condition, gameState, instanceId, defs, stickerDefs)) &&
        canAffordCost(
          getEffectiveActionCost(action.cost, instance),
          instanceId,
          gameState,
          defs,
          stickerDefs,
        ) &&
        canAffordTrackAdvanceCost(action, instance, gameState, defs, stickerDefs),
    )
    .map((action, index) => ({
      id: index + 1,
      type: ActionEffectType.USE_CARD_ACTION,
      usedAction: { instanceId, actionId: action.id },
    }));
}
