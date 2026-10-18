import type { Resources } from '../types';
import type { ResourceEquivalence } from './ResourceEquivalence';
import type { ResourceKey } from './ResourceKey';
import { dedupeResourceOptions } from './dedupeResourceOptions';
import { sanitizeResources } from './sanitizeResources';

function mergeResources(base: Resources, extra: Resources): Resources {
  const merged: Resources = { ...base };
  Object.entries(extra).forEach(([key, value]) => {
    if (value <= 0) return;
    merged[key as ResourceKey] = (merged[key as ResourceKey] ?? 0) + value;
  });
  return merged;
}

function buildGroupAllocations(
  groupResources: ResourceKey[],
  requiredTotal: number,
  availableResources: Resources,
): Resources[] {
  if (requiredTotal <= 0) return [{}];

  const allocations: Resources[] = [];

  const recurse = (index: number, remaining: number, current: Resources) => {
    const resource = groupResources[index];
    const maxAvailable = availableResources[resource] ?? 0;

    if (index === groupResources.length - 1) {
      if (remaining <= maxAvailable) {
        const next = remaining > 0 ? { ...current, [resource]: remaining } : current;
        allocations.push(sanitizeResources(next));
      }
      return;
    }

    const upperBound = Math.min(remaining, maxAvailable);
    for (let amount = 0; amount <= upperBound; amount += 1) {
      const next = amount > 0 ? { ...current, [resource]: amount } : current;
      recurse(index + 1, remaining - amount, next);
    }
  };

  recurse(0, requiredTotal, {});

  return dedupeResourceOptions(allocations);
}

/**
 * Builds all payable resource combinations for one cost option.
 * When no equivalence is provided, this returns either the original cost (if payable) or [].
 */
export function getPayableResourceCostVariants(
  resourceCost: Resources,
  availableResources: Resources,
  equivalence?: ResourceEquivalence,
): Resources[] {
  const normalizedCost = sanitizeResources(resourceCost);

  if (!equivalence) {
    const canAffordExact = Object.entries(normalizedCost).every(
      ([resource, amount]) => (availableResources[resource as ResourceKey] ?? 0) >= amount,
    );
    return canAffordExact ? [normalizedCost] : [];
  }

  const groupIndexByResource = new Map<ResourceKey, number>();
  equivalence.groups.forEach((group, groupIndex) => {
    group.forEach(resource => {
      if (!groupIndexByResource.has(resource)) {
        groupIndexByResource.set(resource, groupIndex);
      }
    });
  });

  const groupTotals = new Array<number>(equivalence.groups.length).fill(0);
  const fixedCost: Resources = {};

  Object.entries(normalizedCost).forEach(([resourceKey, amount]) => {
    const resource = resourceKey as ResourceKey;
    const groupIndex = groupIndexByResource.get(resource);
    if (groupIndex === undefined) {
      fixedCost[resource] = amount;
      return;
    }
    groupTotals[groupIndex] += amount;
  });

  const canAffordFixed = Object.entries(fixedCost).every(
    ([resource, amount]) => (availableResources[resource as ResourceKey] ?? 0) >= amount,
  );
  if (!canAffordFixed) return [];

  let options: Resources[] = [sanitizeResources(fixedCost)];

  for (let groupIndex = 0; groupIndex < equivalence.groups.length; groupIndex += 1) {
    const requiredTotal = groupTotals[groupIndex];
    if (requiredTotal <= 0) continue;

    const allocations = buildGroupAllocations(
      equivalence.groups[groupIndex],
      requiredTotal,
      availableResources,
    );
    if (allocations.length === 0) return [];

    options = options.flatMap(option =>
      allocations.map(allocation => mergeResources(option, allocation)),
    );
  }

  return dedupeResourceOptions(options);
}
