import type { Resources } from '../types';
import type { ResourceKey } from './ResourceKey';

export function sanitizeResources(resources: Resources): Resources {
  return Object.entries(resources).reduce<Resources>((acc, [key, value]) => {
    const amount = Math.max(0, Number(value) || 0);
    if (amount > 0) {
      acc[key as ResourceKey] = amount;
    }
    return acc;
  }, {});
}
