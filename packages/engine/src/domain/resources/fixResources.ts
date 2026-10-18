import type { ResourceCost, Resources } from '../types';

/** Replaces an `'any'` cost amount with the amount the player chose (1 when checking affordability). */
export function fixResources(cost: ResourceCost, amount = 1): Resources {
  return Object.fromEntries(
    Object.entries(cost).map(([key, value]) => [key, value === 'any' ? amount : value]),
  );
}
