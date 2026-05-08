import { ActionEffectType, CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const stop2: CardDef = {
  id: 16,
  name: 'Stop',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Stop',
      actions: [
        {
          id: '16-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              stickers: { ids: [1] },
              cards: {
                tags: [CardTag.LAND],
              },
            },
            {
              id: 2,
              type: ActionEffectType.BOOST_CARD,
              cards: {
                tags: [CardTag.BUILDING],
              },
            },
          ],
        },
      ],
    },
  ],
};
