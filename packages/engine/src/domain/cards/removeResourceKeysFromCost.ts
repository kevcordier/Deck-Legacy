import { fixResources } from '../resources/fixResources';
import type { Cost, Resources } from '../types';
import { removeResourceKeys } from './selection/removeResourceKeys';

export function removeResourceKeysFromCost(cost: Cost, keys: (keyof Resources)[]): Cost {
  if (keys.length === 0 || !cost.resources?.length) return cost;
  return {
    ...cost,
    resources: cost.resources.map(resourceCost =>
      removeResourceKeys(fixResources(resourceCost), keys),
    ),
  };
}
