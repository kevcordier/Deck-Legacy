import {
  ActionType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const shrine: CardDef = {
  id: 68,
  name: 'Shrine',
  states: [
    {
      id: 1,
      name: 'Shrine',
      tags: [CardTag.LAND],
      glory: 3,
      actions: [
        {
          id: '21-1-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: {
              scope: TargetScope.SELF,
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionType.ADD_BOARD_EFFECT,
              cards: {
                scope: TargetScope.BOARD,
              },
              effect: {
                ...CardPassives[PassiveType.STAY_IN_PLAY],
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Sanctuary',
      tags: [CardTag.BUILDING],
      glory: 5,
      actions: [
        {
          id: '21-2-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: {
              scope: TargetScope.SELF,
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionType.ADD_BOARD_EFFECT,
              cards: {
                scope: TargetScope.BOARD,
                number: 2,
              },
              effect: {
                ...CardPassives[PassiveType.STAY_IN_PLAY],
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 3,
                [ResourceType.STONE]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Oratory',
      tags: [CardTag.BUILDING],
      glory: 9,
      actions: [
        {
          id: '21-3-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: {
              scope: TargetScope.SELF,
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionType.ADD_BOARD_EFFECT,
              cards: {
                scope: TargetScope.BOARD,
                number: 3,
              },
              effect: {
                ...CardPassives[PassiveType.STAY_IN_PLAY],
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
                [ResourceType.WOOD]: 2,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Temple',
      tags: [CardTag.BUILDING],
      glory: 15,
      actions: [
        {
          id: '21-4-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: {
              scope: TargetScope.SELF,
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionType.ADD_BOARD_EFFECT,
              cards: {
                scope: TargetScope.BOARD,
                number: 4,
              },
              effect: {
                ...CardPassives[PassiveType.STAY_IN_PLAY],
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
