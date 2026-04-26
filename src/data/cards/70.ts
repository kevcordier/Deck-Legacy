import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const mine: CardDef = {
  id: 70,
  name: 'Mine',
  states: [
    {
      id: 1,
      name: 'Mine',
      tags: [CardTag.BUILDING],
      glory: { amount: 4 },
      productions: [
        {
          [ResourceType.STONE]: 1,
          [ResourceType.IRON]: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Deep Mine',
      tags: [CardTag.BUILDING],
      glory: { amount: 6 },
      productions: [
        {
          [ResourceType.STONE]: 1,
          [ResourceType.IRON]: 2,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Ruby Mine',
      tags: [CardTag.BUILDING],
      glory: { amount: 9 },
      productions: [
        {
          [ResourceType.STONE]: 1,
          [ResourceType.IRON]: 2,
          [ResourceType.GOODS]: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 2,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Diamond Mine',
      glory: { amount: 13 },
      tags: [CardTag.BUILDING],
      productions: [
        {
          [ResourceType.STONE]: 1,
          [ResourceType.IRON]: 2,
          [ResourceType.GOODS]: 2,
        },
      ],
    },
  ],
};
