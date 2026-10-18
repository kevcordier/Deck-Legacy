import { fixResources } from '../resources/fixResources';
import type { CardInstance, Cost } from '../types';
import { removeResourceKeysFromCost } from './removeResourceKeysFromCost';
import { getRemovedResourcesForState } from './selection/getRemovedResourcesForState';

/** `amount` replaces an `'any'` resource amount: the amount the player chose to pay. */
export function getEffectiveActionCost(
  baseCost: Cost | undefined,
  instance: CardInstance,
  amount = 1,
): Cost {
  if (!baseCost) return {};
  const removedKeys = getRemovedResourcesForState(instance, instance.stateId, 'actionCost');
  const fixedCost = baseCost.resources
    ? { ...baseCost, resources: baseCost.resources.map(r => fixResources(r, amount)) }
    : baseCost;
  return removeResourceKeysFromCost(fixedCost, removedKeys);
}
