import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const swamp: CardDef = {
  id: 13,
  name: 'Swamp',
  states: [
    {
      id: 1,
      name: 'Swamp',
      tags: [CardTag.LAND],
      illustration: 'cards/13_1.jpg',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 1,
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Accessible Swamp',
      tags: [CardTag.LAND],
      illustration: 'cards/13_2.jpg',
      glory: { amount: 1 },
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 1,
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Swamp Garden',
      tags: [CardTag.LAND],
      illustration: 'cards/13_3.jpg',
      glory: { amount: 3 },
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 2,
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Exotic Fruit Trees',
      tags: [CardTag.LAND],
      illustration: 'cards/13_4.jpg',
      glory: { amount: 4 },
      productions: [
        {
          [ResourceType.GOODS]: 2,
        },
      ],
    },
  ],
};
