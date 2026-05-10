import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const unknown: CardDef = {
  id: 77,
  name: 'Unknown',
  states: [
    {
      id: 1,
      name: '_____',
      chooseName: true,
      tags: [CardTag.PERSON],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/dcb20f36-d9ef-4deb-8cb2-6691a24ae20d/450x%3Cauto%3E_so',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/dfb385d0-bc0e-4ae5-3b5f-27abfe0e6d00/450x%3Cauto%3E_so',
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
