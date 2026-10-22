import type { CardAction } from '../../../domain/types';

/** The amount paid for an 'any' resource cost is within the action's limits (Statues: 2–20). */
export function isWithinAmountLimits(action: CardAction, amount?: number): boolean {
  if (!action.amountLimits) return true;
  const paid = amount ?? 1;
  const { min = 1, max = Infinity } = action.amountLimits;
  return paid >= min && paid <= max;
}
