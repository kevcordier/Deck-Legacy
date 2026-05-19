import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const hill: CardDef = {
  id: 11,
  name: 'Hill',
  states: [
    {
      id: 1,
      name: 'Hill',
      tags: [CardTag.LAND],
      illustration: 'cards/11_1.jpg',
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
                [ResourceType.GOLD]: 1,
                [ResourceType.WOOD]: 1,
                [ResourceType.STONE]: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Chapel',
      tags: [CardTag.BUILDING],
      illustration: 'cards/11_2.jpg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 1 },
      actions: [
        {
          id: '11-2-1',
          limitedTime: 1,
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [103],
              },
            },
          ],
        },
      ],
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
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Church',
      tags: [CardTag.BUILDING],
      illustration: 'cards/11_3.jpg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 3 },
      actions: [
        {
          id: '11-3-1',
          limitedTime: 1,
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 4,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [104],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 3,
                [ResourceType.IRON]: 1,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Cathedral',
      tags: [CardTag.BUILDING],
      illustration: 'cards/11_4.jpg',
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 7 },
      passives: [
        {
          id: '11-4-1',
          type: PassiveType.ADJUST_PRODUCTION,
          cards: {
            scope: [TargetScope.SELF],
          },
          resources: { [ResourceType.GOLD]: 1 },
          valuePerElement: {
            amount: 1,
            cards: {
              scope: [TargetScope.BOARD],
              tags: [CardTag.PERSON],
            },
          },
        },
      ],
    },
  ],
};
