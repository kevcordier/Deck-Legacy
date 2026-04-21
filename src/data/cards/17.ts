import { ActionType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const army: CardDef = {
  id: 17,
  name: 'Army',
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Army',
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c482b4a9-396c-4bdd-a45d-3a8866cec739/original=true,quality=90/2025-07-18-235304_Flux%20CopaxTimeless_xplus4_0.jpeg',
      actions: [
        {
          id: '17_1_1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionType.TRACK_ADVANCE,
              cards: {
                scope: TargetScope.SELF,
              },
            },
          ],
        },
      ],
      track: {
        cumulative: false,
        inOrder: true,
        steps: [
          {
            id: 1,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 1,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 1 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 2,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 2,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 4 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 3,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 3,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 7 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 4,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 4,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 10 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 5,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 5,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 14 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 6,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 6,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 19 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 7,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 7,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 25 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 8,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 8,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 32 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 9,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 9,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 40 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 10,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 10,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  ids: [135],
                },
              },
              {
                id: 2,
                type: ActionType.UPGRADE_CARD,
                cards: {
                  scope: TargetScope.SELF,
                },
                states: [2],
              },
            ],
          },
        ],
      },
    },
    {
      id: 2,
      name: 'Grand Army',
      glory: 50,
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c482b4a9-396c-4bdd-a45d-3a8866cec739/original=true,quality=90/2025-07-18-235304_Flux%20CopaxTimeless_xplus4_0.jpeg',
      actions: [
        {
          id: '17_2_1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionType.TRACK_ADVANCE,
              cards: {
                scope: TargetScope.SELF,
              },
            },
          ],
        },
      ],
      track: {
        cumulative: false,
        inOrder: true,
        steps: [
          {
            id: 11,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 10,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 10 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 12,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 10,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 20 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 13,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 12,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 30 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 14,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 12,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 40 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
          {
            id: 15,
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 15,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.SET_CUMULATED,
                accumulated: { glory: 50 },
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
          },
        ],
      },
    },
  ],
};
