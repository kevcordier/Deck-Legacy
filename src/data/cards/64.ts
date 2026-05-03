import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const lagoon: CardDef = {
  id: 64,
  name: 'Lagoon',
  states: [
    {
      id: 1,
      name: 'Lagoon',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/8ce23075-8563-4558-8cfa-540bc0f3dbec/anim=false,width=450,optimized=true/1302310152-30-DPM++%203M%20SDE-170733_759241.jpeg',
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
                [ResourceType.WOOD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 3,
                [ResourceType.GOODS]: 1,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 2,
      name: 'Raft',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/bcafdde8-e90b-4180-8b79-0f581960669d/anim=false,width=450,optimized=true/4602A901D7F5A9B81AFB77F09BA8821B88DEC2C4204542D0424D9AAC70F7BFC3.jpeg',
      tags: [CardTag.SEAFARING],
      upgrade: [
        {
          cost: {},
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 3,
      name: 'Sea Gate Wall',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/f10032b5-f327-4db1-890d-ba552649a074/anim=false,width=450,optimized=true/RCHK2Y421FFY2RPH56MHQWZAV0.jpeg',
      tags: [CardTag.BUILDING, CardTag.WALL],
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: {
        amount: 3,
      },
      actions: [
        {
          id: '64-3-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: {
                tags: [CardTag.SEAFARING],
                scope: [TargetScope.DISCARD],
              },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Lush Island',
      tags: [CardTag.LAND, CardTag.SEAFARING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/2e6e536f-b62c-46ae-8b4b-43e47de5c287/anim=false,width=450,optimized=true/FAAF5974BC96DC1C5F041F2068C9E614595C5FDD9F3649513149A5029604CBA8.jpeg',
      productions: [
        {
          [ResourceType.GOLD]: 2,
          [ResourceType.GOODS]: 1,
        },
      ],
      glory: {
        amount: 1,
      },
    },
  ],
};
