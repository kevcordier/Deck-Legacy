import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const missionary: CardDef = {
  id: 88,
  name: 'Missionary',
  states: [
    {
      id: 1,
      name: 'Missionary',
      tags: [CardTag.PERSON],
      illustration: 'cards/88_1.jpg',
      actions: [
        {
          id: '88-1-1',
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
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.BANDIT],
              },
              states: { ids: [2] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Beekeeper',
      illustration: 'cards/88_2.jpg',
      tags: [CardTag.PERSON],
      productions: [
        {
          [ResourceType.GOLD]: 1,
        },
      ],
      glory: { amount: 2 },
      actions: [
        {
          id: '88-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {},
          upgradeTo: 1,
        },
      ],
      track: {
        inOrder: true,
        steps: [
          {
            id: 1,
          },
          {
            id: 2,
          },
          {
            id: 3,
          },
          {
            id: 4,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                cards: {
                  scope: [TargetScope.SELF],
                },
                stickers: { ids: [1] },
              },
            ],
          },
        ],
      },
    },
  ],
};
