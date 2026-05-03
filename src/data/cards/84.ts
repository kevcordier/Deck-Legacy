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
      tags: [CardTag.STATE],
      glory: { amount: 15 },
    },
  ],
};
