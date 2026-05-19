import { CardTag, PassiveType, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const southHills: CardDef = {
  id: 115,
  name: 'South Hills',
  states: [
    {
      id: 1,
      name: 'South Hills',
      tags: [CardTag.LAND],
      illustration: 'cards/115_1.jpg',
      productions: [{ gold: 1 }],
      upgrade: [
        { cost: { resources: [{ stone: 2, gold: 1 }] }, upgradeTo: 2 },
        { cost: { resources: [{ wood: 3, stone: 2 }] }, upgradeTo: 3 },
      ],
    },
    {
      id: 2,
      name: 'Terraced Land',
      tags: [CardTag.LAND],
      illustration: 'cards/115_2.jpg',
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 2 },
      upgrade: [{ cost: { resources: [{ stone: 3 }] }, upgradeTo: 4 }],
    },
    {
      id: 3,
      name: 'Windmill',
      tags: [CardTag.BUILDING],
      illustration: 'cards/115_3.jpg',
      productions: [
        {
          gold: 3,
        },
      ],
      glory: { amount: 4 },
    },
    {
      id: 4,
      name: 'Wall',
      tags: [CardTag.BUILDING, CardTag.WALL],
      illustration: 'cards/115_4.jpg',
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 3 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
