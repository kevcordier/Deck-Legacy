import { PassiveType } from '@engine/domain/enums';
import type { CardDef, GameState, Resources, Sticker } from '@engine/domain/types';

type ResourceKey = keyof Resources;

export type ResourceEquivalence = {
  groups: ResourceKey[][];
};

function sanitizeResources(resources: Resources): Resources {
  return Object.entries(resources).reduce<Resources>((acc, [key, value]) => {
    const amount = Math.max(0, Number(value) || 0);
    if (amount > 0) {
      acc[key as ResourceKey] = amount;
    }
    return acc;
  }, {});
}

function mergeResources(base: Resources, extra: Resources): Resources {
  const merged: Resources = { ...base };
  Object.entries(extra).forEach(([key, value]) => {
    if (value <= 0) return;
    merged[key as ResourceKey] = (merged[key as ResourceKey] ?? 0) + value;
  });
  return merged;
}

function resourceSignature(resources: Resources): string {
  return Object.entries(resources)
    .filter(([, value]) => value > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
}

export function dedupeResourceOptions(options: Resources[]): Resources[] {
  const seen = new Set<string>();
  return options.reduce<Resources[]>((acc, option) => {
    const normalized = sanitizeResources(option);
    const signature = resourceSignature(normalized);
    if (!signature || seen.has(signature)) return acc;
    seen.add(signature);
    return [...acc, normalized];
  }, []);
}

function getEquivalenceResources(passive: { resources?: Partial<Resources> }): ResourceKey[] {
  if (!passive.resources) return [];
  return Object.entries(passive.resources)
    .filter(([, value]) => (value ?? 0) > 0)
    .map(([resource]) => resource as ResourceKey);
}

export function getSourceResourceEquivalence(
  _sourceInstanceId: number,
  gameState: GameState,
  _defs: Record<number, CardDef>,
  _stickerDefs: Record<number, Sticker>,
): ResourceEquivalence | undefined {
  const groups = Object.entries(gameState.boardEffects).flatMap(([, passives]) =>
    passives
      .filter(passive => passive.type === PassiveType.RESOURCE_EQUIVALENCE)
      .map(getEquivalenceResources)
      .filter(resources => resources.length >= 2),
  );

  if (groups.length === 0) return undefined;

  return { groups };
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
