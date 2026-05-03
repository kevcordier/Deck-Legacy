import { CardTag, ResourceType, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const aethanEstate: CardDef = {
  id: 68,
  name: 'Aethan Estate',
  states: [
    {
      id: 1,
      name: 'Aethan Estate',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/407ce3e2-ab83-4631-88d0-bad3faf2f383/original=true,quality=90/00092-3009365662.jpeg',
      tags: [CardTag.LAND],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Aethan Estate',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/407ce3e2-ab83-4631-88d0-bad3faf2f383/original=true,quality=90/00092-3009365662.jpeg',
      tags: [CardTag.LAND],
      glory: { amount: 3 },
      actions: [
        {
          id: '68-2-1',
          trigger: Trigger.ON_PURGE,
          optional: true,
          actionEffects: [],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 4,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Aethan Estate',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/407ce3e2-ab83-4631-88d0-bad3faf2f383/original=true,quality=90/00092-3009365662.jpeg',
      tags: [CardTag.LAND],
      glory: { amount: 6 },
      actions: [
        {
          id: '68-3-1',
          trigger: Trigger.ON_PURGE,
          optional: true,
          actionEffects: [],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 3,
                [ResourceType.STONE]: 3,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Aethan Estate',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/407ce3e2-ab83-4631-88d0-bad3faf2f383/original=true,quality=90/00092-3009365662.jpeg',
      tags: [CardTag.LAND],
      glory: { amount: 10 },
      actions: [
        {
          id: '68-4-1',
          trigger: Trigger.ON_PURGE,
          optional: true,
          actionEffects: [],
        },
      ],
    },
  ],
};
