import { CardTag, PassiveType, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const westCanyon: CardDef = {
  id: 61,
  name: 'West Canyon',
  states: [
    {
      id: 1,
      name: 'West Canyon',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/2156a7aa-6e04-4176-981d-8e4ef810037a/anim=false,width=450,optimized=true/2024-03-04_18-13-03_2486.jpeg',
      productions: [
        {
          stone: 1,
        },
        {
          iron: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                stone: 1,
                iron: 1,
                gold: 1,
                wood: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
        {
          cost: {
            resources: [
              {
                stone: 3,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 2,
      name: 'Miners',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/957a15af-7f01-416b-881c-66dac0ae85b8/anim=false,width=450,optimized=true/DMR7EN9D5GGW70FNTXDNNXCMR0.jpeg',
      glory: { amount: 2 },
      productions: [
        {
          stone: 1,
          iron: 1,
        },
      ],
      passives: [
        {
          id: '61-2-1',
          type: PassiveType.COUNT_AS_2,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                weapon: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Forced Labor',
      tags: [CardTag.STATE],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/de58ff4c-d5d8-436a-9400-9af267bb49a8/anim=false,width=450,optimized=true/2024-05-31_07-44-19_7665.jpeg',
      glory: { amount: -3 },
      productions: [
        {
          stone: 2,
          iron: 2,
        },
      ],
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
