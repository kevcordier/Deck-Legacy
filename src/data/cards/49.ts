import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const cityFire: CardDef = {
  id: 49,
  name: 'City Fire',
  states: [
    {
      id: 1,
      name: 'City Fire',
      tags: [CardTag.EVENT],
      negative: true,
      illustration: 'cards/49_1.jpg',
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '49-1-1',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                tags: [CardTag.BUILDING],
                scope: [TargetScope.DISCARD],
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
    },
    {
      id: 2,
      name: 'Ashlands',
      tags: [CardTag.LAND],
      illustration: 'cards/49_2.jpg',
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
      illustration: 'cards/49_3.jpg',
      actions: [
        {
          id: '49-3-1',
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
