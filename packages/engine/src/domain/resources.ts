import type { Cost, ResourceCost, Resources } from './types';

/** Replaces an `'any'` cost amount with the amount the player chose (1 when checking affordability). */
export function fixResources(cost: ResourceCost, amount = 1): Resources {
  return Object.fromEntries(
    Object.entries(cost).map(([key, value]) => [key, value === 'any' ? amount : value]),
  );
}

/** Whether the player chooses how much of a resource to pay (e.g. Export's goods). */
export function hasAnyAmountCost(cost: Cost | undefined): boolean {
  return cost?.resources?.some(r => Object.values(r).includes('any')) ?? false;
}

export function mergeResources(a: Resources, b?: Resources): Resources {
  const result = JSON.parse(JSON.stringify(a)) as Resources;
  for (const [k, v] of Object.entries(b ?? {})) {
    result[k as keyof Resources] = (result[k as keyof Resources] ?? 0) + v;
  }
  return result;
}
