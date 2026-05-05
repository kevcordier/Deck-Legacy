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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/7aec4cb2-aa6e-4a92-8e4b-b447573d9cdf/anim=false,width=450,optimized=true/2570720676-1.jpeg',
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
