import { BLESSING } from './churchConstants';
import { ActionEffectType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';

/** Bless 1 friendly card in play: the blessing sticker (38) on a card without one. */
export function blessCard(id: number): ActionEffect {
  return {
    id,
    type: ActionEffectType.ADD_STICKER,
    cards: {
      scope: [TargetScope.BOARD, TargetScope.PERMANENTS, TargetScope.FRIENDLY, TargetScope.SELF],
      withoutStickerIds: [BLESSING],
      pickNumber: 1,
    },
    stickers: { ids: [BLESSING] },
  };
}
