import { ActionType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const exportation: CardDef = {
  id: 19,
  name: 'Export',
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Export',
      description: 'Make yourself invaluable for your neighbours, it will surely pay off.',
      actions: [
        {
          id: '19-1-1',
          passive: true,
          actions: [
            {
              id: 1,
              type: ActionType.ADD_CUMULATED,
              cards: {
                scope: TargetScope.SELF,
              },
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
      ],
      track: {
        cumulative: true,
        inOrder: true,
        endsTurn: false,
        preround: true,
        vertical: true,
        steps: [
          {
            id: 1,
            cost: {
              accumulated: 10,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.ADD_STICKER,
                  stickerIds: [1, 2, 3],
                  cards: {
                    tags: [CardTag.LAND],
                  },
                },
              ],
            },
          },
          {
            id: 2,
            cost: {
              accumulated: 20,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.ADD_STICKER,
                  stickerIds: [7],
                  cards: {
                    tags: [CardTag.PERSON],
                  },
                },
              ],
            },
          },
          {
            id: 3,
            cost: {
              accumulated: 30,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.DISCOVER_CARD,
                  cards: {
                    ids: [86],
                  },
                },
              ],
            },
          },
          {
            id: 4,
            cost: {
              accumulated: 40,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.ADD_STICKER,
                  stickerIds: [4, 5, 6],
                  cards: {
                    tags: [CardTag.BUILDING],
                  },
                },
              ],
            },
          },
          {
            id: 5,
            cost: {
              accumulated: 55,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.ADD_STICKER,
                  stickerIds: [2, 3, 4],
                  cards: {
                    scope: TargetScope.FRIENDLY,
                  },
                },
              ],
            },
          },
          {
            id: 6,
            cost: {
              accumulated: 75,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.ADD_STICKER,
                  stickerIds: [10],
                  cards: {
                    scope: TargetScope.ANY,
                  },
                },
              ],
            },
          },
          {
            id: 7,
            cost: {
              accumulated: 100,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.UPGRADE_CARD,
                  states: [2],
                  cards: {
                    scope: TargetScope.SELF,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: 2,
      name: 'Extended Treasury',
      glory: 25,
      description: 'I want to be unreasonably rich and put King Midas to shame.',
      actions: [
        {
          id: '19-2-1',
          passive: true,
          actions: [
            {
              id: 1,
              type: ActionType.ADD_CUMULATED,
              cards: {
                scope: TargetScope.SELF,
              },
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
      ],
      track: {
        cumulative: false,
        inOrder: true,
        endsTurn: false,
        vertical: true,
        steps: [
          {
            id: 8,
            cost: {
              accumulated: 50,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.ADD_STICKER,
                  stickerIds: [8],
                  cards: {
                    tags: [CardTag.LAND],
                  },
                },
                {
                  id: 1,
                  type: ActionType.ADD_STICKER,
                  stickerIds: [8],
                  cards: {
                    tags: [CardTag.LAND],
                  },
                },
              ],
            },
          },
          {
            id: 9,
            cost: {
              accumulated: 50,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.ADD_STICKER,
                  stickerIds: [10],
                  cards: {
                    tags: [CardTag.PERSON],
                  },
                },
              ],
            },
          },
          {
            id: 10,
            cost: {
              accumulated: 75,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.DISCOVER_CARD,
                  cards: {
                    ids: [107],
                  },
                },
              ],
            },
          },
          {
            id: 11,
            cost: {
              accumulated: 100,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.ADD_STICKER,
                  stickerIds: [10],
                  cards: {
                    tags: [CardTag.BUILDING],
                  },
                },
              ],
            },
          },
          {
            id: 12,
            cost: {
              accumulated: 150,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.TRACK_ADVANCE,
                  cards: {
                    scope: TargetScope.PERMANENTS,
                  },
                },
              ],
            },
          },
          {
            id: 13,
            cost: {
              accumulated: 200,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.TRACK_ADVANCE,
                  cards: {
                    scope: TargetScope.PERMANENTS,
                  },
                },
              ],
            },
          },
          {
            id: 14,
            cost: {
              accumulated: 200,
            },
            onAccess: {
              actions: [
                {
                  id: 1,
                  type: ActionType.DISCOVER_CARD,
                  cards: {
                    ids: [117],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
};
