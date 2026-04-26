import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const exportation: CardDef = {
  id: 19,
  name: 'Export',
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Export',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/8a521c20-ba71-47b8-aafd-93539594bc26/anim=false,width=450,optimized=true/Upscale_00002_.jpeg',
      actions: [
        {
          id: '19-1-1',
          passive: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              cards: {
                scope: [TargetScope.SELF],
              },
              accumulated: { goods: 1 },
            },
          ],
          cost: {
            resources: [
              {
                [ResourceType.GOODS]: 1,
              },
            ],
          },
        },
      ],
      track: {
        inOrder: true,
        vertical: true,
        inverse: true,
        steps: [
          {
            id: 1,
            cost: {
              accumulated: { goods: 10 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickerIds: [1, 2, 3],
                cards: {
                  tags: [CardTag.LAND],
                },
              },
            ],
          },
          {
            id: 2,
            cost: {
              accumulated: { goods: 20 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickerIds: [7],
                cards: {
                  tags: [CardTag.PERSON],
                },
              },
            ],
          },
          {
            id: 3,
            cost: {
              accumulated: { goods: 30 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.DISCOVER_CARD,
                cards: {
                  ids: [86],
                },
              },
            ],
          },
          {
            id: 4,
            cost: {
              accumulated: { goods: 40 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickerIds: [4, 5, 6],
                cards: {
                  tags: [CardTag.BUILDING],
                },
              },
            ],
          },
          {
            id: 5,
            cost: {
              accumulated: { goods: 55 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickerIds: [2, 3, 4],
                cards: {
                  scope: [TargetScope.FRIENDLY],
                },
              },
            ],
          },
          {
            id: 6,
            cost: {
              accumulated: { goods: 75 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickerIds: [10],
              },
            ],
          },
          {
            id: 7,
            cost: {
              accumulated: { goods: 100 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                cards: {
                  scope: [TargetScope.SELF],
                },
                accumulated: { goods: 0 },
              },
              {
                id: 2,
                type: ActionEffectType.UPGRADE_CARD,
                states: [2],
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
        ],
      },
    },
    {
      id: 2,
      name: 'Mass Export',
      glory: 25,
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/8a521c20-ba71-47b8-aafd-93539594bc26/anim=false,width=450,optimized=true/Upscale_00002_.jpeg',
      actions: [
        {
          id: '19-2-1',
          passive: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              cards: {
                scope: [TargetScope.SELF],
              },
              accumulated: { goods: 1 },
            },
          ],
          cost: {
            resources: [
              {
                [ResourceType.GOODS]: 1,
              },
            ],
          },
        },
      ],
      track: {
        inOrder: true,
        vertical: true,
        inverse: true,
        steps: [
          {
            id: 8,
            cost: {
              accumulated: { goods: 25 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickerIds: [8],
                cards: {
                  tags: [CardTag.LAND],
                },
              },
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickerIds: [8],
                cards: {
                  tags: [CardTag.LAND],
                },
              },
            ],
          },
          {
            id: 9,
            cost: {
              accumulated: { goods: 50 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickerIds: [10],
                cards: {
                  tags: [CardTag.PERSON],
                },
              },
            ],
          },
          {
            id: 10,
            cost: {
              accumulated: { goods: 75 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.DISCOVER_CARD,
                cards: {
                  ids: [107],
                },
              },
            ],
          },
          {
            id: 11,
            cost: {
              accumulated: { goods: 100 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickerIds: [10],
                cards: {
                  tags: [CardTag.BUILDING],
                },
              },
            ],
          },
          {
            id: 12,
            cost: {
              accumulated: { goods: 150 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.TRACK_ADVANCE,
                cards: {
                  scope: [TargetScope.PERMANENTS],
                },
              },
            ],
          },
          {
            id: 13,
            cost: {
              accumulated: { goods: 200 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.TRACK_ADVANCE,
                cards: {
                  scope: [TargetScope.PERMANENTS],
                },
              },
            ],
          },
          {
            id: 14,
            cost: {
              accumulated: { goods: 250 },
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.DISCOVER_CARD,
                cards: {
                  ids: [117],
                },
              },
            ],
          },
        ],
      },
    },
  ],
};
