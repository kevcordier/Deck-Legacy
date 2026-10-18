import type { Resources } from '../../types';

export function removeResourceKeys(resources: Resources, keys: (keyof Resources)[]): Resources {
  if (keys.length === 0) return resources;

  const removedCounts = keys.reduce<Record<string, number>>((acc, key) => {
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(resources).reduce<Resources>((acc, [key, value]) => {
    const removed = removedCounts[key] ?? 0;
    const nextValue = Math.max(0, (value ?? 0) - removed);
    if (nextValue > 0) {
      acc[key as keyof Resources] = nextValue;
    }
    return acc;
  }, {});
}
