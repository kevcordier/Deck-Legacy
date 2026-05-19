import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

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
      passives: [
        {
          id: '20-1-1',
          type: PassiveType.ADD_TRIGGER,
          trigger: {
            id: '20-1-1',
            type: Trigger.ON_PLAY,
            cards: {
              scope: [TargetScope.DRAWN],
              tags: [CardTag.LAND],
            },
            actions: [
              {
                id: 1,
                type: ActionEffectType.DESTROY_CARD,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
              {
                id: 2,
                type: ActionEffectType.UPGRADE_CARD,
                cards: {
                  scope: [TargetScope.TRIGGER_SOURCE],
                },
                states: { ids: [2] },
              },
            ],
          },
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
