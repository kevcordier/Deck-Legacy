import { ActionEffectType, PendingChoiceType } from '../../../domain/enums';
import type { PendingChoice, ResolvedCost } from '../../../domain/types';
import { isValidSelection } from './isValidSelection';
import { sameValue } from './sameValue';

/** A cost payment: one offered resource option, or offered cards to discard (or destroy). */
export function sanitizeCost(
  resolved: ResolvedCost,
  pending: PendingChoice | undefined,
): ResolvedCost | null {
  if (pending?.kind !== ActionEffectType.COST) return null;
  if (pending.type === PendingChoiceType.CHOOSE_RESOURCE) {
    const offered = pending.choices.some(resources => sameValue(resources, resolved.resources));
    return offered
      ? { resources: resolved.resources, discardedCardIds: [], destroyedCardIds: [] }
      : null;
  }
  if (pending.type !== PendingChoiceType.CHOOSE_CARD) return null;
  // Same rule as the UI (`buildCardCostResolution`): the choice id names a destroy cost.
  const destroy = pending.id.includes('-destroy');
  const cards = destroy ? resolved.destroyedCardIds : resolved.discardedCardIds;
  const others = destroy ? resolved.discardedCardIds : resolved.destroyedCardIds;
  if (others.length > 0 || Object.keys(resolved.resources).length > 0) return null;
  if (!isValidSelection(cards, pending)) return null;
  return {
    resources: {},
    discardedCardIds: destroy ? [] : cards,
    destroyedCardIds: destroy ? cards : [],
  };
}
