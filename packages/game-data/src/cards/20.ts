import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const volcanicEruption: CardDef = {
  id: 20,
  name: 'Volcanic Eruption',
  states: [
    {
      id: 1,
      name: 'Volcanic Eruption',
      negative: true,
      tags: [CardTag.EVENT],
      illustration: 'cards/20_1.jpg',
      actions: [
        {
          id: '20-1-1',
          trigger: Trigger.ON_PLAY,
          triggeredBy: { scope: [TargetScope.DRAWN], tags: [CardTag.LAND] },
          condition: { type: 'not', condition: { type: 'justPlayed' } },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: [TargetScope.DRAWN], tags: [CardTag.LAND], pickNumber: 1 },
            },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Ashlands',
      tags: [CardTag.LAND],
      illustration: 'cards/20_2.jpg',
      glory: { amount: -2 },
      upgrade: [
        {
          cost: { resources: [{ gold: 2 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Young Forest',
      tags: [CardTag.LAND],
      illustration: 'cards/20_3.jpg',
      glory: { amount: 1 },
      actions: [
        {
          id: '20-3-1',
          endsTurn: true,
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
      track: {
        inOrder: true,
        steps: [
          {
            id: 1,
            icon: '*',
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                cards: {
                  scope: [TargetScope.SELF],
                },
                stickers: { ids: [2] },
              },
            ],
          },
          {
            id: 2,
          },
          {
            id: 3,
            icon: '*',
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                cards: {
                  scope: [TargetScope.SELF],
                },
                stickers: { ids: [2] },
              },
            ],
          },
          {
            id: 4,
          },
          {
            id: 5,
            icon: '*',
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                cards: {
                  scope: [TargetScope.SELF],
                },
                stickers: { ids: [2] },
              },
            ],
          },
        ],
      },
    },
  ],
};
