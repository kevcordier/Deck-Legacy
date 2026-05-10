import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const smallHillTown: CardDef = {
  id: 90,
  name: 'Small Hill Town',
  states: [
    {
      id: 1,
      name: 'Small Hill Town',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/2d8ad81a-feaa-4546-996f-627cf1650f07/450x%3Cauto%3E_so',
      tags: [CardTag.LAND],
      glory: { amount: 6 },
      actions: [
        {
          id: '90-1-1',
          cost: { resources: [{ gold: 2 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    gold: 1,
                  },
                  {
                    wood: 1,
                  },
                  {
                    stone: 1,
                  },
                  {
                    weapon: 1,
                  },
                  {
                    iron: 1,
                  },
                  {
                    goods: 1,
                  },
                ],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ wood: 2, stone: 2 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Hill Town',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/dc782d15-be39-485c-912c-bad456c8fd0b/450x%3Cauto%3E_so',
      glory: { amount: 8 },
      actions: [
        {
          id: '90-2-1',
          cost: { resources: [{ gold: 1 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    gold: 1,
                  },
                  {
                    wood: 1,
                  },
                  {
                    stone: 1,
                  },
                  {
                    weapon: 1,
                  },
                  {
                    iron: 1,
                  },
                  {
                    goods: 1,
                  },
                ],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ wood: 3, stone: 3 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Large Town',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/6b5594d4-6605-40b2-bc9e-0765ffa25a79/450x%3Cauto%3E_so',
      glory: { amount: 10 },
      actions: [
        {
          id: '90-3-1',
          cost: {
            resources: [
              {
                gold: 1,
              },
              {
                wood: 1,
              },
              {
                stone: 1,
              },
              {
                weapon: 1,
              },
              {
                iron: 1,
              },
              {
                goods: 1,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    gold: 1,
                  },
                  {
                    wood: 1,
                  },
                  {
                    stone: 1,
                  },
                  {
                    weapon: 1,
                  },
                  {
                    iron: 1,
                  },
                  {
                    goods: 1,
                  },
                ],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ wood: 6 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'City on a Hill',
      tags: [CardTag.LAND],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/3dffb556-c505-43c7-a568-f2d8784436e8/450x%3Cauto%3E_so',
      glory: { amount: 12 },
      actions: [
        {
          id: '90-4-1',
          cost: { resources: [{ gold: 2 }] },
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLACE_CARD_IN_PILE,
              cards: {
                scope: [TargetScope.SELF],
              },
              position: 'bottom',
              deck: 'discovery',
            },
            {
              id: 2,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [106],
              },
            },
          ],
        },
        {
          id: '90-4-2',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  {
                    gold: 1,
                  },
                  {
                    wood: 1,
                  },
                  {
                    stone: 1,
                  },
                  {
                    weapon: 1,
                  },
                  {
                    iron: 1,
                  },
                  {
                    goods: 1,
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
