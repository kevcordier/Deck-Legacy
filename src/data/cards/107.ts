import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const jewelExtraction: CardDef = {
  id: 107,
  name: 'Jewel Extraction',
  states: [
    {
      id: 1,
      name: 'Jewel Extraction',
      tags: [CardTag.EVENT],
      glory: { amount: 15 },
      productions: [{ stone: 1, iron: 2, goods: 2 }],
      upgrade: [
        {
          cost: {
            resources: [
              {
                wood: 2,
                iron: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Jewel Cutting',
      tags: [CardTag.EVENT],
      glory: { amount: 18 },
      productions: [{ iron: 2, goods: 3 }],
      upgrade: [
        {
          cost: {
            resources: [
              {
                wood: 3,
                iron: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Jewel Polishing',
      tags: [CardTag.EVENT],
      glory: { amount: 21 },
      productions: [{ iron: 3, goods: 4 }],
      upgrade: [
        {
          cost: {
            resources: [
              {
                wood: 2,
                iron: 4,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Jewel Exhibit',
      tags: [CardTag.EVENT],
      glory: { amount: 25 },
      productions: [{ iron: 3, goods: 6 }],
    },
  ],
};
