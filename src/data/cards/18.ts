import { ActionType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const treasury: CardDef = {
  id: 18,
  name: 'Treasury',
  permanent: true,
  states: [
    {
      id: 1,
      name: 'Treasury',
      description: 'Store up those riches, you never know when you might need them!',
      track: {
        cumulative: false,
        inOrder: true,
        endsTurn: true,
        steps: [
          {
            id: 1,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 1,
                },
              ],
            },
            onAccess: {
              glory: 1,
            },
          },
          {
            id: 2,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 2,
                },
              ],
            },
            onAccess: {
              glory: 2,
            },
          },
          {
            id: 3,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 3,
                },
              ],
            },
            onAccess: {
              glory: 3,
            },
          },
          {
            id: 4,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 4,
                },
              ],
            },
            onAccess: {
              glory: 5,
            },
          },
          {
            id: 5,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 5,
                },
              ],
            },
            onAccess: {
              glory: 7,
            },
          },
          {
            id: 6,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 6,
                },
              ],
            },
            onAccess: {
              glory: 10,
            },
          },
          {
            id: 7,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 7,
                },
              ],
            },
            onAccess: {
              glory: 14,
            },
          },
          {
            id: 8,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 8,
                },
              ],
            },
            onAccess: {
              glory: 19,
            },
          },
          {
            id: 9,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 9,
                },
              ],
            },
            onAccess: {
              glory: 25,
            },
          },
          {
            id: 10,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 10,
                },
              ],
            },
            onAccess: {
              glory: 32,
            },
          },
          {
            id: 11,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 11,
                },
              ],
            },
            onAccess: {
              glory: 40,
            },
          },
          {
            id: 12,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 12,
                },
              ],
            },
            onAccess: {
              actions: [
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
          },
        ],
      },
    },
    {
      id: 2,
      name: 'Extended Treasury',
      glory: 50,
      description: 'I want to be unreasonably rich and put King Midas to shame.',
      track: {
        cumulative: false,
        inOrder: true,
        endsTurn: true,
        steps: [
          {
            id: 13,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 13,
                },
              ],
            },
            onAccess: {
              glory: 10,
            },
          },
          {
            id: 14,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 14,
                },
              ],
            },
            onAccess: {
              glory: 20,
            },
          },
          {
            id: 15,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 15,
                },
              ],
            },
            onAccess: {
              glory: 30,
            },
          },
          {
            id: 16,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 16,
                },
              ],
            },
            onAccess: {
              glory: 40,
            },
          },
          {
            id: 17,
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 17,
                },
              ],
            },
            onAccess: {
              glory: 50,
            },
          },
        ],
      },
    },
  ],
};
