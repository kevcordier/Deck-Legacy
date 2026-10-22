import type { Resources } from '../types';

/** Total amount of resources, all types together. */
export function countResources(resources: Resources): number {
  return Object.values(resources).reduce((total, value) => total + Math.max(0, value ?? 0), 0);
}
