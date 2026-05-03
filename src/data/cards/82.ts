import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const spinningWheel: CardDef = {
  id: 82,
  name: 'Spinning Wheel',
  states: [
    {
      id: 1,
      name: 'Spinning Wheel',
      tags: [CardTag.INVENTION],
      glory: { amount: 2 },
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Silk',
      tags: [CardTag.INVENTION],
      glory: { amount: 4 },
      productions: [
        {
          [ResourceType.GOODS]: 1,
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
      name: 'Cloth Export',
      tags: [CardTag.INVENTION],
      glory: { amount: 6 },
      productions: [
        {
          [ResourceType.GOODS]: 2,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 4,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Fashion',
      tags: [CardTag.INVENTION],
      glory: { amount: 10 },
      productions: [
        {
          [ResourceType.GOODS]: 3,
        },
      ],
    },
  ],
};
