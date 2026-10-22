import { countResources } from '../../../domain/resources/countResources';
import type { PendingChoice, Resources } from '../../../domain/types';

/** A split payment: the asked total, within what the player can spend, type by type. */
export function isValidSplit(resources: Resources, pending: PendingChoice): boolean {
  const [available] = pending.choices as Resources[];
  if (!available || countResources(resources) !== pending.total) return false;
  return Object.entries(resources).every(
    ([type, amount]) =>
      Number.isInteger(amount) &&
      (amount ?? 0) >= 0 &&
      (amount ?? 0) <= (available[type as keyof Resources] ?? 0),
  );
}
