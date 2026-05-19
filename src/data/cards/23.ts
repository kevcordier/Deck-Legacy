import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const entrepreneur: CardDef = {
  id: 23,
  name: 'Entrepreneur',
  states: [
    {
      id: 1,
      name: 'Entrepreneur',
      tags: [CardTag.PERSON],
      illustration: 'cards/23_1.jpg',
      productions: [
        {
          goods: 1,
        },
      ],
      actions: [
        {
          id: '23-1-1',
          endsTurn: true,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [118],
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
                [ResourceType.GOLD]: 1,
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
      name: 'Hotel',
      tags: [CardTag.BUILDING],
      illustration: 'cards/23_2.jpg',
      productions: [
        {
          gold: 1,
          goods: 1,
        },
      ],
      actions: [
        {
          id: '23-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.GOLD]: 1,
              },
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
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Cozy Pub',
      tags: [CardTag.BUILDING],
      illustration: 'cards/23_3.jpg',
      productions: [
        {
          goods: 2,
        },
      ],
      actions: [
        {
          id: '23-3-1',
          limitedTime: 1,
          cost: {
            discard: [
              {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [92],
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
                [ResourceType.GOODS]: 2,
                [ResourceType.WOOD]: 2,
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
      name: 'Tavern',
      tags: [CardTag.BUILDING],
      illustration: 'cards/23_4.jpg',
      productions: [
        {
          goods: 2,
          gold: 2,
        },
      ],
      actions: [
        {
          id: '23-4-1',
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [87],
              },
            },
          ],
        },
      ],
    },
  ],
};
