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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c0a9fb7a-78c2-452f-a2f4-947f4c527cd8/anim=false,width=450,optimized=true/38CERAJFMBW55EYDDDX8W2T1M0.jpeg',
      actions: [],
    },
    {
      id: 2,
      name: 'Ashlands',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/19b5f023-3004-486a-abc8-15d6ac466082/anim=false,width=450,optimized=true/TR74NQJ6BGPS2X7T51C9Q6FNJ0.jpeg',
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/86f44a78-5253-43b3-0045-b513f59fc800/anim=false,width=450,optimized=true/312846.jpeg',
      actions: [
        {
          id: '20-3-a0',
          endsTurn: true,
          actionEffects: [
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
        steps: [
          {
            id: 1,
            effects: [
              {
                id: 1,
                type: ActionType.ADD_STICKER,
                stickerIds: [2],
              },
            ],
          },
          {
            id: 2,
          },
          {
            id: 3,
            effects: [
              {
                id: 1,
                type: ActionType.ADD_STICKER,
                stickerIds: [2],
              },
            ],
          },
          {
            id: 4,
          },
          {
            id: 5,
            effects: [
              {
                id: 1,
                type: ActionType.ADD_STICKER,
                stickerIds: [2],
              },
            ],
          },
        ],
      },
    },
  ],
};
