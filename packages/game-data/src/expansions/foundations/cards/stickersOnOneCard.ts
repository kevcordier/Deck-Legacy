import { RESOURCE_STICKERS } from './scienceConstants';
import { ActionEffectType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';

/** `count` resource stickers on 1 card: the first effect picks the card, the next ones stick on it. */
export function stickersOnOneCard(count: number, cards: ActionEffect['cards']): ActionEffect[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    type: ActionEffectType.ADD_STICKER,
    cards: index === 0 ? cards : { scope: [TargetScope.LAST_SELECTED] },
    stickers: { ids: RESOURCE_STICKERS, pickNumber: 1 },
  }));
}
