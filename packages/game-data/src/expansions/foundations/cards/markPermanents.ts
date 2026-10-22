import { ActionEffectType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';

/** Marks 1 box on `count` permanent cards: a no-op effect picks the card, then its track advances. */
export function markPermanents(count: number): ActionEffect[] {
  return Array.from({ length: count }, (_, index) => [
    {
      id: index * 2 + 1,
      type: ActionEffectType.ADD_CUMULATED,
      value: 0,
      cards: { scope: [TargetScope.PERMANENTS, TargetScope.WITH_TRACK], pickNumber: 1 },
    },
    {
      id: index * 2 + 2,
      type: ActionEffectType.TRACK_ADVANCE,
      cards: { scope: [TargetScope.LAST_SELECTED] },
    },
  ]).flat();
}
