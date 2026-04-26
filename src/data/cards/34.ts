import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const mason: CardDef = {
  id: 34,
  name: 'Mason',
  states: [
    {
      id: 1,
      name: 'Mason',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/649b5682-509e-4cbd-bdb7-7ca61511aa7c/anim=false,width=450,optimized=true/RBB7BJW5YGRBW6WY6P5MTZM1N0.jpeg',
      productions: [
        {
          stone: 1,
        },
      ],
      actions: [
        {
          id: '34-1-1',
          cost: {
            resources: [
              {
                gold: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [88, 89],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                gold: 2,
                stone: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Brick Road',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/77dce95d-fdee-44b0-bdcd-c3fd19be4f9a/anim=false,width=450,optimized=true/00103-288352753.jpeg',
      glory: { amount: 3 },
      productions: [
        {
          gold: 1,
        },
      ],
      actions: [
        {
          id: '34-2-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [109, 110],
              },
            },
            {
              id: 2,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                ids: [109, 110],
                scope: [TargetScope.DISCOVERY],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                stone: 4,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Stone Street',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/9461f8c3-9abb-4049-b2d4-df5f40de2bb1/anim=false,width=450,optimized=true/00004-2661110346.jpeg',
      glory: { amount: 7 },
      productions: [
        {
          gold: 1,
        },
      ],
      actions: [
        {
          id: '34-3-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [111, 112],
              },
            },
            {
              id: 2,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                ids: [111, 112],
                scope: [TargetScope.DISCOVERY],
              },
            },
          ],
        },
      ],
    },
  ],
};
