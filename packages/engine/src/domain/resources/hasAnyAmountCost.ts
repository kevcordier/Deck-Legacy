import type { Cost } from '../types';

/** Whether the player chooses how much of a resource to pay (e.g. Export's goods). */
export function hasAnyAmountCost(cost: Cost | undefined): boolean {
  return cost?.resources?.some(r => Object.values(r).includes('any')) ?? false;
}
