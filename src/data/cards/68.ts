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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/f59490b7-0f35-40f7-b90c-31c3fbe0cd14/anim=false,width=450,optimized=true/2023-12-03%20-%2015.10.49.jpeg',
      glory: 3,
      actions: [
        {
          id: '21-1-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: {
              scope: [TargetScope.SELF],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD],
              },
              effect: {
                ...CardPassives[PassiveType.STAY_IN_PLAY],
                cards: {
                  scope: [TargetScope.SELF],
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/67985b0d-b178-4ead-a388-25f46add1d9f/anim=false,width=450,optimized=true/8CABABBFA51496A7D1A13B09F48FE371C7B7B561D90AB0B7AE1CDC25AF4168AC.jpeg',
      glory: 5,
      actions: [
        {
          id: '21-2-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: {
              scope: [TargetScope.SELF],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD],
                number: 2,
              },
              effect: {
                ...CardPassives[PassiveType.STAY_IN_PLAY],
                cards: {
                  scope: [TargetScope.SELF],
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/1a6733df-1254-44b5-b304-b49f9813c9e4/anim=false,width=450,optimized=true/00177-1658054072.jpeg',
      glory: 9,
      actions: [
        {
          id: '21-3-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: {
              scope: [TargetScope.SELF],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD],
                number: 3,
              },
              effect: {
                ...CardPassives[PassiveType.STAY_IN_PLAY],
                cards: {
                  scope: [TargetScope.SELF],
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
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e17ee73b-9b0e-4f2b-aa1e-7e78c4cfa1c9/anim=false,width=450,optimized=true/00087-2899013593.jpeg',
      glory: 15,
      actions: [
        {
          id: '21-4-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: {
              scope: [TargetScope.SELF],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD],
                number: 4,
              },
              effect: {
                ...CardPassives[PassiveType.STAY_IN_PLAY],
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
