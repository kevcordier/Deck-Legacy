import type { Resources } from '../types';
import { countResources } from './countResources';

/**
 * A resource cost lowered by `discount` units the player chooses (Crane): they pay `total` units,
 * each type within its cost and what they have.
 */
export function getDiscountedPayment(
  cost: Resources,
  owned: Resources,
  discount: number,
): { payable: Resources; total: number } {
  const payable = Object.fromEntries(
    Object.entries(cost)
      .map(([type, amount]) => [type, Math.min(amount ?? 0, owned[type as keyof Resources] ?? 0)])
      .filter(([, amount]) => (amount as number) > 0),
  ) as Resources;
  return { payable, total: Math.max(0, countResources(cost) - discount) };
}
