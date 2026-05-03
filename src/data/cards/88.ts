import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const missionary: CardDef = {
  id: 88,
  name: 'Missionary',
  states: [
    {
      id: 1,
      name: 'Missionary',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/73000c23-90cb-4924-b674-a885720c9cba/anim=false,width=450,optimized=true/03BKNQ3THTSJ7S8AXBBE9A74H0.jpeg',
      actions: [
        {
          id: '88-1-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.BOARD],
                ids: [14, 16, 60, 64],
              },
              states: [2],
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Beekeeper',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/c9ac5a15-7b60-4dc1-b491-cbc1bfaf5034/450x%3Cauto%3E_so',
      tags: [CardTag.PERSON],
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 2 },
      actions: [
        {
          id: '88-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {},
          upgradeTo: 1,
        },
      ],
      track: {
        inOrder: true,
        steps: [
          {
            id: 1,
          },
          {
            id: 2,
          },
          {
            id: 3,
          },
          {
            id: 4,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                cards: {
                  scope: [TargetScope.SELF],
                },
                stickers: { ids: [1] },
              },
            ],
          },
        ],
      },
    },
  ],
};
