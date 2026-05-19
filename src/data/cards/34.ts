import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const mason: CardDef = {
  id: 34,
  name: 'Mason',
  states: [
    {
      id: 1,
      name: 'Mason',
      tags: [CardTag.PERSON],
      illustration: 'cards/34_1.jpg',
      productions: [
        {
          stone: 1,
        },
      ],
      actions: [
        {
          id: '34-1-1',
          limitedTime: 2,
          cost: {
            resources: [
              {
                gold: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [88, 89],
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
                gold: 2,
                stone: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Brick Road',
      tags: [CardTag.LAND],
      illustration: 'cards/34_2.jpg',
      glory: { amount: 3 },
      productions: [
        {
          gold: 1,
        },
      ],
      actions: [
        {
          id: '34-2-1',
          endsTurn: true,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [109, 110],
              },
            },
            {
              id: 2,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                ids: [109, 110],
                scope: [TargetScope.DISCOVERY],
                autoPick: true,
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
                stone: 4,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Stone Street',
      tags: [CardTag.LAND],
      illustration: 'cards/34_3.jpg',
      glory: { amount: 7 },
      productions: [
        {
          gold: 1,
        },
      ],
      actions: [
        {
          id: '34-3-1',
          endsTurn: true,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [111, 112],
              },
            },
            {
              id: 2,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                ids: [111, 112],
                scope: [TargetScope.DISCOVERY],
                autoPick: true,
              },
            },
          ],
        },
      ],
    },
  ],
};
