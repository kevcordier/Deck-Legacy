import { ActionEffectType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';

/** "Destroy this card" (the {{destroy}} effects). */
export function destroySelf(id: number): ActionEffect {
  return { id, type: ActionEffectType.DESTROY_CARD, cards: { scope: [TargetScope.SELF] } };
}
