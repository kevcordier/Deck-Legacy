import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const { GOLD, GOODS } = ResourceType;

/** Earl Alistair / Goldharvest Estate (Foundations 133): a side chosen when discovered. */
export const earlAlistair: CardDef = {
  id: 306,
  name: 'Earl Alistair',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Earl Alistair',
      tags: [CardTag.PERSON],
      productions: [{ [GOLD]: 2, [GOODS]: 2 }],
    },
    {
      id: 2,
      name: 'Goldharvest Estate',
      tags: [CardTag.LAND],
      actions: [
        {
          // Add sticker gold or goods to another land in play with less than 5 production
          id: '306-2-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.PERMANENTS],
                tags: [CardTag.LAND],
                having: { maxProduction: 4 },
                pickNumber: 1,
              },
              stickers: { ids: [1, 6], pickNumber: 1 },
            },
          ],
        },
      ],
    },
  ],
};
