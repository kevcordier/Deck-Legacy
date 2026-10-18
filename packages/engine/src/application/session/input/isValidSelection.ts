import type { PendingChoice } from '../../../domain/types';
import { sameValue } from './sameValue';
import { stableJson } from './stableJson';

/**
 * Selected values must be distinct offered choices. Card choices list a card once per unit it
 * counts for (`COUNT_AS_2`); the count must reach the minimum (or every offered unit) and stay
 * within the maximum, as the UI requires.
 */
export function isValidSelection(selected: unknown[] | undefined, pending: PendingChoice): boolean {
  if (new Set(selected?.map(stableJson)).size !== selected?.length) return false;
  const units = (value: unknown) =>
    pending.choices.filter(choice => sameValue(choice, value)).length;
  if (selected.some(value => units(value) === 0)) return false;
  const count = selected.reduce<number>((total, value) => total + units(value), 0);
  return (
    count >= Math.min(pending.pickMin, pending.choices.length) && selected.length <= pending.pickMax
  );
}
