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
            onAccess: {
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
            onAccess: {
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
            onAccess: {
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
            onAccess: {
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
            onAccess: {
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
            onAccess: {
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
            onAccess: {
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
            onAccess: {
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
            onAccess: {
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
            onAccess: {
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c482b4a9-396c-4bdd-a45d-3a8866cec739/original=true,quality=90/2025-07-18-235304_Flux%20CopaxTimeless_xplus4_0.jpeg',
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
            onAccess: {
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
            onAccess: {
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
            onAccess: {
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
            onAccess: {
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
            onAccess: {
              glory: 50,
            },
          },
        ],
      },
    },
  ],
};
