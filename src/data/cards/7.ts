import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const river: CardDef = {
  id: 7,
  name: 'River',
  states: [
    {
      id: 1,
      name: 'River',
      tags: [CardTag.LAND],
      illustration: 'cards/7_1.jpg',
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
      ],
    },
    {
      id: 2,
      name: 'Bridge',
      tags: [CardTag.LAND],
      illustration: 'cards/7_2.jpg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 2 },
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Stone Bridge',
      illustration: 'cards/7_3.jpg',
      tags: [CardTag.LAND],
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 4 },
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Explorers',
      illustration: 'cards/7_4.jpg',
      tags: [CardTag.PERSON],
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 4 },
      actions: [
        {
          id: '7-4-1',
          limitedTime: 4,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [71, 72, 73, 74],
              },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [3] },
            },
          ],
        },
      ],
    },
  ],
};
