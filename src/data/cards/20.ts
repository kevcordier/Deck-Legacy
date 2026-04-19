import { ActionType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const volcanicEruption: CardDef = {
  id: 20,
  name: 'Volcanic Eruption',
  states: [
    {
      id: 1,
      name: 'Volcanic Eruption',
      negative: true,
      tags: [CardTag.EVENT],
      actions: [],
    },
    {
      id: 2,
      name: 'Ashlands',
      tags: [CardTag.LAND],
      glory: -2,
      upgrade: [
        {
          cost: { resources: [{ gold: 2 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Young Forest',
      tags: [CardTag.LAND],
      actions: [
        {
          id: '20-3-a0',
          endsTurn: true,
          actions: [
            {
              id: 1,
              type: ActionType.TRACK_ADVANCE,
              cards: {
                scope: TargetScope.SELF,
              },
            },
          ],
        },
      ],
      track: {
        cumulative: false,
        inOrder: true,
        endsTurn: false,
        steps: [
          {
            id: 1,
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.ADD_STICKER,
                  stickerIds: [2],
                },
              ],
            },
          },
          {
            id: 2,
          },
          {
            id: 3,
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.ADD_STICKER,
                  stickerIds: [2],
                },
              ],
            },
          },
          {
            id: 4,
          },
          {
            id: 5,
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.ADD_STICKER,
                  stickerIds: [2],
                },
              ],
            },
          },
        ],
      },
    },
  ],
};
