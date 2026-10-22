import { ActionEffectType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';

/** Turns this card to `stateId` (an arrow on the card). */
export function flipTo(id: number, stateId: number): ActionEffect {
  return {
    id,
    type: ActionEffectType.UPGRADE_CARD,
    cards: { scope: [TargetScope.SELF] },
    states: { ids: [stateId] },
  };
}
