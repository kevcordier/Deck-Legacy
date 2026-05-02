import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const statue: CardDef = {
  id: 65,
  name: 'Statue',
  states: [
    {
      id: 1,
      name: 'Statue',
      tags: [CardTag.BUILDING],
      glory: {
        amount: 2,
      },
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 4,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Monument',
      tags: [CardTag.BUILDING],
      glory: {
        amount: 5,
      },
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 4,
                [ResourceType.WOOD]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Obelisk',
      tags: [CardTag.BUILDING],
      glory: {
        amount: 10,
      },
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 6,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Obelisk',
      tags: [CardTag.BUILDING],
      glory: {
        amount: 15,
      },
    },
  ],
};
