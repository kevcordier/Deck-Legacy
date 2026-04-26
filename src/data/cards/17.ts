import { ActionEffectType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const army: CardDef = {
  id: 17,
  name: 'Army',
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Army',
      glory: {
        amount: 0,
        valuePerElement: {
          amount: 1,
          accumulation: true,
        },
      },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c482b4a9-396c-4bdd-a45d-3a8866cec739/original=true,quality=90/2025-07-18-235304_Flux%20CopaxTimeless_xplus4_0.jpeg',
      actions: [
        {
          id: '17_1_1',
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
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 1,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 1,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 2,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 2,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 4,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 3,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 3,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 7,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 4,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 4,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 10,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 5,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 5,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 14,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 6,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 6,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 19,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 7,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 7,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 25,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 8,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 8,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 32,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 9,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 9,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 40,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 10,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 10,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.DISCOVER_CARD,
                cards: {
                  ids: [135],
                },
              },
              {
                id: 2,
                type: ActionEffectType.UPGRADE_CARD,
                cards: {
                  scope: [TargetScope.SELF],
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
      glory: {
        amount: 50,
        valuePerElement: {
          amount: 1,
          accumulation: true,
        },
      },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c482b4a9-396c-4bdd-a45d-3a8866cec739/original=true,quality=90/2025-07-18-235304_Flux%20CopaxTimeless_xplus4_0.jpeg',
      actions: [
        {
          id: '17_2_1',
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
            id: 11,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 10,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 10,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 12,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 10,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 20,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 13,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 12,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 30,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 14,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 12,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 40,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            ],
          },
          {
            id: 15,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 15,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 50,
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
