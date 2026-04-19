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
      glory: 1,
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
      glory: 3,
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
      glory: 4,
      productions: [
        {
          [ResourceType.GOODS]: 2,
        },
      ],
    },
  ],
};
