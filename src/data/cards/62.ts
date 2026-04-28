import { ActionEffectType, CardTag, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const shore: CardDef = {
  id: 62,
  name: 'Shore',
  states: [
    {
      id: 1,
      name: 'Shore',
      tags: [CardTag.LAND],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c0cd4ecf-2a01-4318-a8f2-513617dbac82/anim=false,width=450,optimized=true/ComfyUI_02607_.jpeg',
      productions: [
        {
          gold: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                gold: 1,
                wood: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Shipyard',
      tags: [CardTag.BUILDING],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/f7f1496f-a4e6-41b8-8797-28b320697eda/anim=false,width=450,optimized=true/461951725.jpeg',
      glory: { amount: 3 },
      productions: [
        {
          gold: 1,
        },
        {
          wood: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                gold: 1,
                wood: 4,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Trade Ship',
      tags: [CardTag.SEAFARING, CardTag.SHIP],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/49b87759-454e-46c6-881e-4d1ca63f1498/anim=false,width=450,optimized=true/123B63DA067F12E1BB8CF819C793D8C36190E322864E922E7A566210F6581FF4.jpeg',
      glory: { amount: 6 },
      productions: [
        {
          gold: 1,
        },
        {
          wood: 1,
        },
        {
          goods: 1,
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                gold: 1,
                wood: 2,
              },
            ],
            discard: {
              number: 2,
              tags: [CardTag.PERSON],
            },
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Trade Route',
      tags: [CardTag.SEAFARING, CardTag.SHIP],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/0b2765ee-3bd7-4709-aaed-f28f3c0d9443/anim=false,width=450,optimized=true/02347-3254999818-In%20the%20painting,%20the%20artist%20captures%20a%20breathtaking%20medieval%20scene%20as%20the%20sun%20begins%20its%20descent,%20casting%20a%20warm,%20golden%20glow%20ac.jpeg',
      glory: { amount: 13 },
      productions: [
        {
          gold: 1,
        },
        {
          wood: 1,
        },
        {
          iron: 1,
        },
        {
          goods: 1,
        },
      ],
      actions: [
        {
          id: '62-4-1',
          trigger: Trigger.ON_PLAY,
          optional: false,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [76],
              },
            },
          ],
        },
      ],
    },
  ],
};
