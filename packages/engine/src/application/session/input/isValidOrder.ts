import type { PendingChoice, ResolvedActionEffect } from '../../../domain/types';

/** An order of exactly the offered cards, with at most `pickMax` of them destroyed. */
export function isValidOrder(choice: ResolvedActionEffect, pending: PendingChoice): boolean {
  const order = choice.instanceIds ?? [];
  const destroyed = choice.destroyedIds ?? [];
  const given = [...order, ...destroyed].sort((a, b) => a - b);
  const offered = (pending.choices as number[]).slice().sort((a, b) => a - b);
  return (
    destroyed.length <= (pending.pickMax ?? 1) &&
    given.length === offered.length &&
    given.every((id, index) => id === offered[index])
  );
}
