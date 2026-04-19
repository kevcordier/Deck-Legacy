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
                  [ResourceType.WEAPON]: 1,
                },
              ],
            },
            onClick: {
              glory: 1,
            },
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
            onClick: {
              glory: 4,
            },
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
            onClick: {
              glory: 7,
            },
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
            onClick: {
              glory: 10,
            },
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
            onClick: {
              glory: 14,
            },
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
            onClick: {
              glory: 19,
            },
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
            onClick: {
              glory: 25,
            },
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
            onClick: {
              glory: 32,
            },
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
            onClick: {
              glory: 40,
            },
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
            onClick: {
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
          },
        ],
      },
    },
    {
      id: 2,
      name: 'Grand Army',
      glory: 50,
      track: {
        cumulative: false,
        inOrder: true,
        endsTurn: true,
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
            onClick: {
              glory: 10,
            },
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
            onClick: {
              glory: 20,
            },
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
            onClick: {
              glory: 30,
            },
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
            onClick: {
              glory: 40,
            },
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
            onClick: {
              glory: 50,
            },
          },
        ],
      },
    },
  ],
};
