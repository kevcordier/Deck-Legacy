import type { PendingChoice, ResolvedCost } from '@deck-legacy/engine/domain/types';

export function buildCardCostResolution(
  choice: PendingChoice,
  selectedIds: number[],
): ResolvedCost {
  const isDestroyCost = choice.id.includes('-destroy');
  return {
    resources: {},
    discardedCardIds: isDestroyCost ? [] : selectedIds,
    destroyedCardIds: isDestroyCost ? selectedIds : [],
  };
}
