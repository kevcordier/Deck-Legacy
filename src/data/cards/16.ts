import { ActionType, CardTag, Trigger } from '@engine/domain/enums';
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
          trigger: Trigger.ON_DISCOVER,
          actions: [
            {
              id: 1,
              type: ActionType.ADD_STICKER,
              stickerIds: [1],
              cards: {
                tags: [CardTag.LAND],
              },
            },
            {
              id: 2,
              type: ActionType.BOOST_CARD,
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
