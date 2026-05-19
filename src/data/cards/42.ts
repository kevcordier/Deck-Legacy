import { ActionEffectType, CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const magistrate: CardDef = {
  id: 42,
  name: 'Magistrate',
  states: [
    {
      id: 1,
      name: 'Magistrate',
      tags: [CardTag.PERSON],
      illustration: 'cards/42_1.jpg',
      actions: [
        {
          id: '42-1-1',
          endsTurn: true,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [130],
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
                stone: 3,
              },
            ],
          },
        },
      ],
    },
    {
      id: 2,
      name: 'Magistrate',
      tags: [CardTag.PERSON],
      illustration: 'cards/42_2.jpg',
      actions: [
        {
          id: '42-2-1',
          endsTurn: true,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [131],
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
                stone: 2,
                iron: 2,
              },
            ],
          },
        },
      ],
    },
    {
      id: 3,
      name: 'Magistrate',
      tags: [CardTag.PERSON],
      glory: { amount: 2 },
      illustration: 'cards/42_3.jpg',
      actions: [
        {
          id: '42-3-1',
          endsTurn: true,
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [132],
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
                stone: 3,
                iron: 2,
              },
            ],
          },
        },
      ],
    },
    {
      id: 4,
      name: 'Strategist',
      tags: [CardTag.PERSON, CardTag.ELDER],
      glory: { amount: 5 },
      illustration: 'cards/42_4.jpg',
      actions: [
        {
          id: '42-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: {
                tags: [CardTag.KNIGHT, CardTag.WALL],
              },
            },
          ],
        },
      ],
    },
  ],
};
