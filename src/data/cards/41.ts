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
      illustration: 'cards/41_1.jpg',
      actions: [
        {
          id: '41-1-1',
          limitedTime: 1,
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
      illustration: 'cards/41_2.jpg',
      actions: [
        {
          id: '41-2-1',
          limitedTime: 1,
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
      illustration: 'cards/41_3.jpg',
      actions: [
        {
          id: '41-3-1',
          limitedTime: 1,
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
      illustration: 'cards/41_4.jpg',
      actions: [
        {
          id: '41-4-1',
          limitedTime: 1,
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
