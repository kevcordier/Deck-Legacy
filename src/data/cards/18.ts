import { ActionEffectType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const treasury: CardDef = {
  id: 18,
  name: 'Treasury',
  states: [
    {
      id: 1,
      name: 'Treasury',
      permanent: true,
      glory: {
        amount: 0,
        valuePerElement: {
          amount: 1,
          accumulation: true,
        },
      },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/12e629f3-73f2-4edb-91ce-bfb83fa2c2d2/anim=false,width=450,optimized=true/3EDE5F2CA834FA6C31BA7A57752727C762B454184E7180BF089258EA6C299E19.jpeg',
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
                  [ResourceType.GOLD]: 1,
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
                  [ResourceType.GOLD]: 2,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 2,
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
                  [ResourceType.GOLD]: 3,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 3,
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
                  [ResourceType.GOLD]: 4,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.SET_CUMULATED,
                accumulated: 5,
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
                  [ResourceType.GOLD]: 5,
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
            id: 6,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 6,
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
            id: 7,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 7,
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
            id: 8,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 8,
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
            id: 9,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 9,
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
            id: 10,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 10,
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
            id: 11,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 11,
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
            id: 12,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 12,
                },
              ],
            },
            effects: [
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
      name: 'Extended Treasury',
      permanent: true,
      glory: {
        amount: 50,
        valuePerElement: {
          amount: 1,
          accumulation: true,
        },
      },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/12e629f3-73f2-4edb-91ce-bfb83fa2c2d2/anim=false,width=450,optimized=true/3EDE5F2CA834FA6C31BA7A57752727C762B454184E7180BF089258EA6C299E19.jpeg',
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
            id: 13,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 13,
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
            id: 14,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 14,
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
            id: 15,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 15,
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
            id: 16,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 16,
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
            id: 17,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 17,
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
