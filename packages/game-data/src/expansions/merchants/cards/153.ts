import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef } from '@deck-legacy/engine/domain/types';

const stickerOnPerson = (stickerId: number): ActionEffect => ({
  id: 1,
  type: ActionEffectType.ADD_STICKER,
  stickers: { ids: [stickerId] },
  cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON] },
});

const thenTo = (stateId: number): ActionEffect => ({
  id: 2,
  type: ActionEffectType.UPGRADE_CARD,
  cards: { scope: [TargetScope.SELF] },
  states: { ids: [stateId] },
});

export const furs: CardDef = {
  id: 153,
  name: 'Goat Fur',
  states: [
    {
      id: 1,
      name: 'Goat Fur',
      tags: [CardTag.ITEM],
      actions: [{ id: '153-1-1', actionEffects: [stickerOnPerson(1), thenTo(2)] }],
    },
    {
      id: 2,
      name: 'Camel Fur',
      tags: [CardTag.ITEM],
      // Erratum: sticker 18 is not a production, it gives the person an activated effect.
      actions: [{ id: '153-2-1', actionEffects: [stickerOnPerson(18), thenTo(3)] }],
    },
    {
      id: 3,
      name: 'Cheeta Fur',
      tags: [CardTag.ITEM],
      actions: [{ id: '153-3-1', actionEffects: [stickerOnPerson(7), thenTo(4)] }],
    },
    {
      id: 4,
      name: 'Rabbit Fur',
      tags: [CardTag.ITEM],
      actions: [
        {
          id: '153-4-1',
          cost: { destroy: { scope: [TargetScope.SELF] } },
          actionEffects: [stickerOnPerson(17)],
        },
      ],
    },
  ],
};
