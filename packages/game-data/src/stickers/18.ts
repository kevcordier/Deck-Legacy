import { ActionEffectType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { Sticker } from '@deck-legacy/engine/domain/types';

/** Merchants: an activated effect for the person it is added to. */
export const bottomOfDeck: Sticker = {
  id: 18,
  label: 'Place this at the bottom of your deck',
  action: {
    id: 'sticker-18',
    actionEffects: [
      {
        id: 1,
        type: ActionEffectType.PLACE_CARD_IN_PILE,
        cards: { scope: [TargetScope.SELF] },
        deck: 'draw',
        position: 'bottom',
      },
    ],
  },
};
