import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const smallHillTown: CardDef = {
  id: 90,
  name: 'Small Hill Town',
  states: [
    {
      id: 1,
      name: 'Small Hill Town',
      illustration: 'cards/90_1.jpg',
      tags: [CardTag.LAND],
      glory: { amount: 6 },
      actions: [
        {
          id: '90-1-1',
          cost: { resources: [{ gold: 2 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [{ any: 1 }],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ wood: 2, stone: 2 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Hill Town',
      tags: [CardTag.LAND],
      illustration: 'cards/90_2.jpg',
      glory: { amount: 8 },
      actions: [
        {
          id: '90-2-1',
          cost: { resources: [{ gold: 1 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [{ any: 1 }],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ wood: 3, stone: 3 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Large Town',
      tags: [CardTag.LAND],
      illustration: 'cards/90_3.jpg',
      glory: { amount: 10 },
      actions: [
        {
          id: '90-3-1',
          cost: {
            resources: [
              {
                gold: 1,
              },
              {
                wood: 1,
              },
              {
                stone: 1,
              },
              {
                weapon: 1,
              },
              {
                iron: 1,
              },
              {
                goods: 1,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [{ any: 1 }],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { resources: [{ wood: 6 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'City on a Hill',
      tags: [CardTag.LAND],
      illustration: 'cards/90_4.jpg',
      glory: { amount: 12 },
      actions: [
        {
          id: '90-4-1',
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [106],
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
            {
              id: 3,
              type: ActionEffectType.PLACE_CARD_IN_PILE,
              cards: {
                scope: [TargetScope.SELF],
              },
              position: 'bottom',
              deck: 'discovery',
            },
          ],
        },
        {
          id: '90-4-2',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [{ any: 1 }],
              },
            },
          ],
        },
      ],
    },
  ],
};
