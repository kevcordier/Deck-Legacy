import { flipTo } from './flipTo';
import { RESOURCE_STICKERS } from './scienceConstants';
import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef } from '@deck-legacy/engine/domain/types';

/** "ANY 1 OTHER sticker": the non-resource stickers of the base game and of the Church. */
const OTHER_STICKERS = [7, 8, 10, 11, 16, 17, 18, 38];

const onThis = (id: number, ids: number[]): ActionEffect => ({
  id,
  type: ActionEffectType.ADD_STICKER,
  cards: { scope: [TargetScope.SELF] },
  stickers: { ids, pickNumber: 1 },
});

/** Printing Press (Foundations 86): turns into the Holy Bible, with 8 stickers. */
export const printingPress: CardDef = {
  id: 259,
  name: 'Printing Press',
  states: [
    {
      id: 1,
      name: 'Printing Press',
      tags: [CardTag.INVENTION],
      actions: [
        {
          id: '259-1-1',
          endsTurn: true,
          actionEffects: [
            flipTo(1, 2),
            ...Array.from({ length: 7 }, (_, index) => onThis(index + 2, RESOURCE_STICKERS)),
            onThis(9, OTHER_STICKERS),
          ],
        },
      ],
    },
    { id: 2, name: 'Holy Bible', tags: [CardTag.ITEM], glory: { amount: 20 } },
  ],
};
