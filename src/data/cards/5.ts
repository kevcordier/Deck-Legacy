import { ActionEffectType, CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const trader: CardDef = {
  id: 5,
  name: 'Trader',
  states: [
    {
      id: 1,
      name: 'Trader',
      tags: [CardTag.PERSON],
      illustration: 'cards/5_1.jpg',
      actions: [
        {
          id: '5-1-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.WOOD]: 1,
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
      name: 'Bazaar',
      tags: [CardTag.BUILDING],
      illustration: 'cards/5_2.jpg',
      glory: { amount: 1 },
      actions: [
        {
          id: '5-2-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
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
                    [ResourceType.WOOD]: 1,
                  },
                  {
                    [ResourceType.STONE]: 1,
                  },
                ],
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
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Market',
      tags: [CardTag.BUILDING],
      illustration: 'cards/5_3.jpg',
      glory: { amount: 3 },
      actions: [
        {
          id: '5-3-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
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
                    [ResourceType.WOOD]: 1,
                  },
                  {
                    [ResourceType.STONE]: 1,
                  },
                  {
                    [ResourceType.IRON]: 1,
                  },
                ],
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
                [ResourceType.GOLD]: 5,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Festival',
      tags: [CardTag.EVENT],
      illustration: 'cards/5_4.jpg',
      glory: { amount: 4 },
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
        {
          [ResourceType.WOOD]: 1,
        },
        {
          [ResourceType.STONE]: 1,
        },
        {
          [ResourceType.IRON]: 1,
        },
      ],
    },
  ],
};
