import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const publicPunishment: CardDef = {
  id: 84,
  name: 'Public Punishment',
  states: [
    {
      id: 1,
      name: 'Public Punishment',
      tags: [CardTag.INVENTION],
      illustration: 'cards/84_1.jpg',
      glory: { amount: -2 },
      productions: [{ [ResourceType.WEAPON]: 1 }],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.IRON]: 2 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Torture Device',
      tags: [CardTag.INVENTION, CardTag.ITEM],
      illustration: 'cards/84_2.jpg',
      glory: { amount: -3 },
      productions: [{ [ResourceType.WEAPON]: 1, [ResourceType.GOODS]: 1 }],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.IRON]: 4 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Torture Chamber',
      tags: [CardTag.BUILDING],
      illustration: 'cards/84_3.jpg',
      glory: { amount: -6 },
      productions: [{ [ResourceType.WEAPON]: 2 }],
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.GOLD]: 6 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Post-Barbaric',
      illustration: 'cards/84_4.jpg',
      tags: [CardTag.STATE],
      glory: { amount: 15 },
    },
  ],
};
