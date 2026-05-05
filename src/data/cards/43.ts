import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const mightyMound: CardDef = {
  id: 43,
  name: 'Mighty Mound',
  states: [
    {
      id: 1,
      name: 'Mighty Mound',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/97117fa6-dfb4-4f70-8ed2-2273306e8684/anim=false,width=450,optimized=true/00211-323982169-0000.jpeg',
      tags: [CardTag.LAND],
      upgrade: [
        {
          upgradeTo: 2,
          cost: {
            resources: [
              {
                wood: 3,
              },
            ],
          },
        },
      ],
    },
    {
      id: 2,
      name: 'Hill Settlement',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/0422215f-c777-4c58-9cc0-87556d3c9639/anim=false,width=450,optimized=true/mklanIllustriousReal_v10-30-7-1051972383-H5420.jpeg',
      tags: [CardTag.LAND],
      productions: [
        {
          gold: 1,
        },
      ],
      glory: { amount: 1 },
      upgrade: [
        {
          upgradeTo: 3,
          cost: {
            resources: [
              {
                wood: 4,
              },
            ],
          },
        },
      ],
    },
    {
      id: 3,
      name: 'Hill Village',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/453eb5d1-a476-4112-a69a-dfbbf1e78270/anim=false,width=450,optimized=true/FXAZNQZH3J6T4JCHWME63MYNT0.jpeg',
      tags: [CardTag.LAND],
      productions: [
        {
          gold: 2,
        },
      ],
      glory: { amount: 3 },
      upgrade: [
        {
          upgradeTo: 4,
          cost: {
            resources: [
              {
                wood: 4,
                stone: 2,
              },
            ],
          },
        },
      ],
    },
    {
      id: 4,
      name: 'Peak Village',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/89ab407a-7aa0-427d-8634-ffef4cb37b97/anim=false,width=450,optimized=true/4e05bfae-39e4-43a9-98ce-2934cfe0029d-1.jpeg',
      tags: [CardTag.LAND],
      productions: [
        {
          gold: 2,
          goods: 1,
        },
      ],
      glory: { amount: 6 },
      actions: [
        {
          id: '43-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [105],
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [1] },
            },
          ],
        },
      ],
    },
  ],
};
