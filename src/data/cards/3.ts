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
      illustration: 'cards/3_1.jpg',
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
      illustration: 'cards/3_2.jpg',
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
      illustration: 'cards/3_3.jpg',
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
      illustration: 'cards/3_4.jpg',
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
