import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const unknown: CardDef = {
  id: 77,
  name: 'Unknown',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: '_____',
      chooseName: true,
      tags: [CardTag.PERSON],
      illustration: 'cards/77_1.jpg',
      productions: [{ weapon: 1, goods: 1 }],
      actions: [
        {
          id: '77-1-1',
          trigger: Trigger.ON_PLAY,
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
        inverse: true,
        vertical: true,
        steps: [
          {
            id: 1,
          },
          {
            id: 2,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickers: { ids: [5, 10] },
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 3,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickers: { ids: [6, 10] },
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
        ],
      },
    },
    {
      id: 2,
      name: '_____',
      chooseName: true,
      tags: [CardTag.PERSON],
      illustration: 'cards/77_2.jpg',
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '77-2-1',
          trigger: Trigger.ON_PLAY,
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
        inverse: true,
        vertical: true,
        steps: [
          {
            id: 4,
          },
          {
            id: 5,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickers: { ids: [1, 2, 3, 4, 5, 6] },
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 6,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickers: { ids: [1, 2, 3, 4, 5, 6] },
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
        ],
      },
    },
  ],
};
