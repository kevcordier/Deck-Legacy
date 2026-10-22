import { ActionEffectType } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';

/** "Gain any `count` resources": one choice per unit. */
export function gainAny(id: number, count: number): ActionEffect {
  return {
    id,
    type: ActionEffectType.ADD_RESOURCES,
    resources: { choice: [{ any: 1 }] },
    ...(count > 1 && { repeat: count }),
  };
}
