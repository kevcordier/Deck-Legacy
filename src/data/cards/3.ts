import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const forest: CardDef = {
  id: 3,
  name: 'Forest',
  states: [
    {
      id: 1,
      name: 'Forest',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/1d7adfad-280d-4cc5-8c88-97f3a42cb7b5/anim=false,width=450,optimized=true/8088900BBA42AB5468EFEAE413FD1584F4F2ED2F8DB7A12E06D3E3E1E945503D.jpeg',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 2,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
      actions: [
        {
          id: '3-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.WOOD]: 3,
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [2] },
            },
          ],
        },
      ],
      productions: [
        {
          [ResourceType.WOOD]: 1,
        },
      ],
    },
    {
      id: 2,
      name: 'Felled Forest',
      tags: [CardTag.LAND],
      illustration:
        'https://www.azolifesciences.com/image-handler/ts/20200320043042/ri/673/picture/2020/3/shutterstock_569562037.jpg',
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 1,
              },
            ],
          },
          upgradeTo: 1,
        },
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
                [ResourceType.WOOD]: 1,
                [ResourceType.STONE]: 1,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Lumberjack',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/289541b5-4f30-4dba-936f-68502266080f/width=450,quality=90/00079-3523319267.jpeg',
      glory: { amount: 2 },
      productions: [
        {
          [ResourceType.WOOD]: 2,
        },
      ],
    },
    {
      id: 4,
      name: 'Sacred Well',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a4fa3901-a970-4c5b-8e43-002c66fded99/width=450,quality=90/00084.jpeg',
      glory: { amount: 2 },
      actions: [
        {
          id: '3-4-1',
          cost: {
            destroy: { scope: [TargetScope.SELF] },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [82, 83] },
            },
          ],
        },
      ],
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
    },
  ],
};
