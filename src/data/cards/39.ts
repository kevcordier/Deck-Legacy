import { ActionEffectType, CardTag } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const envoy: CardDef = {
  id: 39,
  name: 'Envoy',
  states: [
    {
      id: 1,
      name: 'Envoy',
      tags: [CardTag.PERSON],
      illustration: 'cards/39_1.jpg',
      actions: [
        {
          id: '39-1-1',
          endsTurn: true,
          limitedTime: 1,
          cost: {
            resources: [
              {
                gold: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [119],
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
                gold: 3,
              },
            ],
          },
        },
      ],
    },
    {
      id: 2,
      name: 'Emissary',
      tags: [CardTag.PERSON],
      illustration: 'cards/39_2.jpg',
      glory: { amount: 1 },
      actions: [
        {
          id: '39-2-1',
          limitedTime: 1,
          endsTurn: true,
          cost: {
            resources: [
              {
                gold: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [120],
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
                gold: 6,
              },
            ],
          },
        },
      ],
    },
    {
      id: 3,
      name: 'Diplomat',
      tags: [CardTag.PERSON],
      illustration: 'cards/39_3.jpg',
      glory: { amount: 2 },
      actions: [
        {
          id: '39-3-1',
          limitedTime: 1,
          endsTurn: true,
          cost: {
            resources: [
              {
                gold: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [121],
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
                gold: 6,
              },
            ],
          },
        },
      ],
    },
    {
      id: 4,
      name: 'Ambassador',
      tags: [CardTag.PERSON],
      illustration: 'cards/39_4.jpg',
      glory: { amount: 5 },
      actions: [
        {
          id: '39-4-1',
          limitedTime: 1,
          endsTurn: true,
          cost: {
            resources: [
              {
                gold: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [122],
              },
            },
          ],
        },
      ],
    },
  ],
};
