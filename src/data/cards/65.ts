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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/9ebef3ae-b43c-4fc6-db28-2ab47cfbcf00/anim=false,width=450,optimized=true/334685.jpeg',
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/753d66f0-06f2-454a-b8c9-f3f74d52b562/anim=false,width=450,optimized=true/2024-07-09_21-25-52_9643.jpeg',
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/b0e6692d-241c-4a31-968c-0727e7bb9a4b/anim=false,width=450,optimized=true/Sample_00090_.jpeg',
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
      name: 'Golden Pillar',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c32fc635-ffd7-473f-a552-e0f3068d5ba7/anim=false,width=450,optimized=true/3F375FEE0DD182D3EF60CAB36E407CDD61EEBEA522CD71D90A70F8D4AC55D459.jpeg',
      tags: [CardTag.BUILDING],
      glory: {
        amount: 15,
      },
    },
  ],
};
