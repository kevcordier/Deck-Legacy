import { TargetScope } from '@deck-legacy/engine/domain/enums';
import type { Condition } from '@deck-legacy/engine/domain/types';

/** The card `instanceId` still has a box to mark. */
export function hasStepsLeft(instanceId: number): Condition {
  return {
    type: 'cardCount',
    cards: { ids: [instanceId], scope: [TargetScope.SELF, TargetScope.WITH_TRACK] },
    min: 1,
  };
}
