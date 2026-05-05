import { CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const pineForest: CardDef = {
  id: 109,
  name: 'Pine Forest',
  chooseState: [1, 3],
  states: [
    {
      id: 1,
      name: 'Pine Forest',
      tags: [CardTag.LAND],
      productions: [{ wood: 1 }],
      upgrade: [
        {
          cost: { resources: [{ gold: 2, iron: 1 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Pine Forest',
      tags: [CardTag.LAND],
      productions: [{ wood: 2 }],
      glory: { amount: 1 },
    },
    {
      id: 3,
      name: 'Pond',
      tags: [CardTag.LAND],
      productions: [{ gold: 1 }],
      upgrade: [
        {
          cost: { resources: [{ wood: 4 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Fish Pond',
      tags: [CardTag.LAND],
      productions: [{ gold: 2, goods: 1 }],
      glory: { amount: 1 },
    },
  ],
};
