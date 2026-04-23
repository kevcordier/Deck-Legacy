import { ActionType, CardTag, PassiveType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const inventor: CardDef = {
  id: 26,
  name: 'Inventor',
  states: [
    {
      id: 1,
      name: 'Inventor',
      tags: [CardTag.PERSON],
      glory: 0,
      passives: [
        {
          id: 'inventor-1',
          type: PassiveType.INCREASE_GLORY,
          valuePerElement: {
            amount: 1,
            glory: 5,
            accumulation: 'accumulation',
          },
        },
      ],
      track: {
        inOrder: true,
        steps: [
          {
            id: 1,
            effects: [
              {
                id: 1,
                type: ActionType.ADD_CUMULATED,
                cards: { scope: [TargetScope.SELF] },
                accumulated: { accumulation: 1 },
              },
            ],
          },
          {
            id: 2,
            effects: [
              {
                id: 1,
                type: ActionType.ADD_CUMULATED,
                cards: { scope: [TargetScope.SELF] },
                accumulated: { accumulation: 1 },
              },
            ],
          },
          {
            id: 3,
            effects: [
              {
                id: 1,
                type: ActionType.ADD_CUMULATED,
                cards: { scope: [TargetScope.SELF] },
                accumulated: { accumulation: 1 },
              },
            ],
          },
        ],
      },
      upgrade: [
        {
          cost: { resources: [{ [ResourceType.GOLD]: 4 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Inspired Inventor',
      tags: [CardTag.PERSON],
      glory: 0,
      passives: [
        {
          id: 'inventor-1',
          type: PassiveType.INCREASE_GLORY,
          valuePerElement: {
            amount: 1,
            glory: 5,
            accumulation: 'accumulation',
          },
        },
      ],
      actions: [
        {
          id: '26-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: [1],
            },
            {
              id: 2,
              type: ActionType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
            {
              id: 3,
              type: ActionType.DISCOVER_CARD,
              cards: { ids: [97, 98, 99] },
            },
            {
              id: 4,
              type: ActionType.ADD_RESOURCES,
              valuePerElement: {
                amount: 1,
                resource: [
                  ResourceType.GOLD,
                  ResourceType.WOOD,
                  ResourceType.STONE,
                  ResourceType.IRON,
                  ResourceType.WEAPON,
                  ResourceType.GOODS,
                ],
                accumulation: 'accumulation',
              },
            },
          ],
        },
      ],
    },
  ],
};
