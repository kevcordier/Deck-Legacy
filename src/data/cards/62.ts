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
      illustration: 'cards/62_1.jpg',
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
      illustration: 'cards/62_2.jpg',
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
      illustration: 'cards/62_3.jpg',
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
            discard: [
              {
                pickNumber: 2,
                tags: [CardTag.PERSON],
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Trade Route',
      tags: [CardTag.SEAFARING, CardTag.SHIP],
      illustration: 'cards/62_4.jpg',
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
          limitedTime: 1,
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
