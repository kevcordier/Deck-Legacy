import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const unknown: CardDef = {
  id: 77,
  name: 'Unknown',
  states: [
    {
      id: 1,
      name: '___',
      chooseName: true,
      tags: [CardTag.PERSON],
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
                stickerIds: [5, 10],
                cards: {
                  scope: [TargetScope.SELF],
                },
                pickNumber: 1,
              },
            ],
          },
          {
            id: 3,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickerIds: [6, 10],
                cards: {
                  scope: [TargetScope.SELF],
                },
                pickNumber: 1,
              },
            ],
          },
        ],
      },
    },
    {
      id: 2,
      name: '___',
      chooseName: true,
      tags: [CardTag.PERSON],
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
            id: 1,
          },
          {
            id: 2,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickerIds: [1, 2, 3, 4, 5, 6],
                cards: {
                  scope: [TargetScope.SELF],
                },
                pickNumber: 1,
              },
            ],
          },
          {
            id: 3,
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickerIds: [1, 2, 3, 4, 5, 6],
                cards: {
                  scope: [TargetScope.SELF],
                },
                pickNumber: 1,
              },
            ],
          },
        ],
      },
    },
  ],
};
