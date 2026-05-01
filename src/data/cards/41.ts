import { ActionEffectType, CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const traveler: CardDef = {
  id: 41,
  name: 'Traveller',
  states: [
    {
      id: 1,
      name: 'Traveller',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/7453a1f7-b5f5-4eaa-8325-9d68e884355c/anim=false,width=450,optimized=true/TZC6AQS68Z2KPZ1EY0ZX3KHNQ0.jpeg',
      actions: [
        {
          id: '41-1-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [126],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          upgradeTo: 2,
          cost: {
            resources: [
              {
                goods: 3,
              },
            ],
          },
        },
      ],
    },
    {
      id: 2,
      name: 'Traveller',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/fed1ef0d-e748-4806-82f2-81c1c9bb0fdc/anim=false,width=450,optimized=true/NMV1STHBSY5PDYDCEAX4834MQ0.jpeg',
      actions: [
        {
          id: '41-2-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [127],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          upgradeTo: 3,
          cost: {
            resources: [
              {
                goods: 3,
              },
            ],
          },
        },
      ],
    },
    {
      id: 3,
      name: 'Traveller',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/44e0b91f-d1e9-4641-8165-aed05326b6f9/anim=false,width=450,optimized=true/NC6RKX2W2ZYX4FRFH8G1NJ83G0.jpeg',
      actions: [
        {
          id: '41-3-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [128],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          upgradeTo: 4,
          cost: {
            resources: [
              {
                goods: 5,
              },
            ],
          },
        },
      ],
    },
    {
      id: 4,
      name: 'Traveller',
      tags: [CardTag.PERSON],
      glory: { amount: 2 },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/91b81c8d-2c5c-47d9-bc47-db309c95d908/anim=false,width=450,optimized=true/VKXSZ9HJE5S4Z0Z5W91MFKMP60.jpeg',
      actions: [
        {
          id: '41-4-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [129],
              },
            },
          ],
        },
        {
          id: '41-4-2',
          cost: {
            discard: [
              {
                tags: [CardTag.LAND],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                gold: 1,
                wood: 1,
                stone: 1,
                weapon: 1,
                goods: 1,
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                gold: 1,
                wood: 1,
                stone: 1,
                weapon: 1,
                goods: 1,
              },
            },
          ],
        },
      ],
    },
  ],
};
