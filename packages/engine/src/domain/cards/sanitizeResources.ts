import type { Resources } from '../types';

export function sanitizeResources(resources: Resources): Resources {
  return Object.entries(resources).reduce<Resources>((acc, [key, value]) => {
    const clampedValue = Math.max(0, Number(value) || 0);
    if (clampedValue > 0) {
      acc[key as keyof Resources] = clampedValue;
    }
    return acc;
  }, {});
}
