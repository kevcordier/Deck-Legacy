import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const exportation: CardDef = {
  id: 19,
  name: 'Export',
  states: [
    {
      id: 1,
      name: 'Export',
      permanent: true,
      illustration: 'cards/19_1.jpg',
      actions: [
        {
          id: '19-1-1',
          unlimited: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              cards: {
                scope: [TargetScope.SELF],
              },
              value: 1,
            },
          ],
          cost: {
            resources: [
              {
                [ResourceType.GOODS]: 1,
              },
            ],
          },
        },
        {
          id: '19-1-2',
          trigger: Trigger.END_OF_ROUND,
          optional: true,
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
        vertical: true,
        inverse: true,
        steps: [
          {
            id: 1,
            cost: {
              accumulated: 10,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickers: { ids: [1, 2, 3] },
                cards: {
                  tags: [CardTag.LAND],
                },
              },
            ],
          },
          {
            id: 2,
            cost: {
              accumulated: 20,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickers: { ids: [7] },
                cards: {
                  tags: [CardTag.PERSON],
                },
              },
            ],
          },
          {
            id: 3,
            cost: {
              accumulated: 30,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.DISCOVER_CARD,
                cards: {
                  ids: [86],
                },
              },
            ],
          },
          {
            id: 4,
            cost: {
              accumulated: 40,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickers: { ids: [4, 5, 6] },
                cards: {
                  tags: [CardTag.BUILDING],
                },
              },
            ],
          },
          {
            id: 5,
            cost: {
              accumulated: 55,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickers: { ids: [2, 3, 4] },
                cards: {
                  scope: [
                    TargetScope.FRIENDLY,
                    TargetScope.DISCARD,
                    TargetScope.DECK,
                    TargetScope.BOARD,
                  ],
                },
              },
            ],
          },
          {
            id: 6,
            cost: {
              accumulated: 75,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickers: { ids: [10] },
                cards: {
                  scope: [
                    TargetScope.FRIENDLY,
                    TargetScope.DISCARD,
                    TargetScope.DECK,
                    TargetScope.BOARD,
                  ],
                },
              },
            ],
          },
          {
            id: 7,
            cost: {
              accumulated: 100,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                cards: {
                  scope: [TargetScope.SELF],
                },
                value: 0,
              },
              {
                id: 2,
                type: ActionEffectType.UPGRADE_CARD,
                states: { ids: [2] },
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
      name: 'Mass Export',
      permanent: true,
      glory: { amount: 25 },
      illustration: 'cards/19_2.jpg',
      actions: [
        {
          id: '19-2-1',
          unlimited: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              cards: {
                scope: [TargetScope.SELF],
              },
              value: 1,
            },
          ],
          cost: {
            resources: [
              {
                [ResourceType.GOODS]: 1,
              },
            ],
          },
        },
        {
          id: '19-2-2',
          trigger: Trigger.END_OF_ROUND,
          optional: true,
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
        vertical: true,
        inverse: true,
        steps: [
          {
            id: 8,
            cost: {
              accumulated: 25,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickers: { ids: [8] },
                cards: {
                  tags: [CardTag.LAND],
                  pickNumber: 2,
                },
              },
            ],
          },
          {
            id: 9,
            cost: {
              accumulated: 50,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickers: { ids: [10] },
                cards: {
                  tags: [CardTag.PERSON],
                },
              },
            ],
          },
          {
            id: 10,
            cost: {
              accumulated: 75,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.DISCOVER_CARD,
                cards: {
                  ids: [107],
                },
              },
            ],
          },
          {
            id: 11,
            cost: {
              accumulated: 100,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.ADD_STICKER,
                stickers: { ids: [10] },
                cards: {
                  tags: [CardTag.BUILDING],
                },
              },
            ],
          },
          {
            id: 12,
            cost: {
              accumulated: 150,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.TRACK_ADVANCE,
                cards: {
                  scope: [TargetScope.PERMANENTS, TargetScope.WITH_TRACK],
                },
              },
            ],
          },
          {
            id: 13,
            cost: {
              accumulated: 200,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.TRACK_ADVANCE,
                cards: {
                  scope: [TargetScope.PERMANENTS, TargetScope.WITH_TRACK],
                  pickMin: 0,
                  pickMax: 999,
                },
              },
            ],
          },
          {
            id: 14,
            cost: {
              accumulated: 250,
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.DISCOVER_CARD,
                cards: {
                  ids: [117],
                },
              },
            ],
          },
        ],
      },
    },
  ],
};
