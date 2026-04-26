import { CardTag, ResourceType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const swamp: CardDef = {
  id: 13,
  name: 'Swamp',
  states: [
    {
      id: 1,
      name: 'Swamp',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/3165d515-623f-43b8-ba37-f78105f9f7f8/anim=false,width=450,optimized=true/00153-2044446087.jpeg',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 1,
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Accessible Swamp',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e93ceb2d-4c04-4289-b349-ba2c4d6b7a2d/anim=false,width=450,optimized=true/00006-901614128-before-highres-fix.jpeg',
      glory: { amount: 1 },
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 1,
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Swamp Garden',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/febbccd3-c1bb-4e50-8bb4-45b20c747fd2/anim=false,width=450,optimized=true/00028-1054968466.jpeg',
      glory: { amount: 3 },
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 2,
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Exotic Fruit Trees',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/b59819ee-e525-427c-af1f-3eb2cca90b37/anim=false,width=450,optimized=true/00156-573721298.jpeg',
      glory: { amount: 4 },
      productions: [
        {
          [ResourceType.GOODS]: 2,
        },
      ],
    },
  ],
};
