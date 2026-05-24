import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';

const emptyStep = (id: number): StepDef => ({ id });

export const borderDispute: CardDef = {
  id: 121,
  name: 'Border Dispute',
  states: [
    {
      id: 1,
      name: 'Border Dispute',
      tags: [CardTag.EVENT],
      illustration: 'cards/121_1.webp',
      permanent: true,
      passives: [
        {
          id: '121-1-1',
          type: PassiveType.STAY_IN_PLAY,
          cards: {
            scope: [TargetScope.BOARD],
            tags: [CardTag.LAND],
          },
        },
      ],
      actions: [
        {
          id: '121-1-2',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Espionage',
      tags: [CardTag.EVENT],
      illustration: 'cards/121_2.webp',
      permanent: true,
      passives: [
        {
          id: '121-2-1',
          type: PassiveType.ADD_TRIGGER,
          trigger: {
            id: '121-2-1',
            type: Trigger.ON_PLAY,
            cards: {
              scope: [TargetScope.DRAWN],
              tags: [CardTag.PERSON],
            },
            actions: [
              {
                id: 1,
                type: ActionEffectType.CHOOSE_EFFECT,
                effects: [
                  {
                    id: 1,
                    type: ActionEffectType.TRACK_ADVANCE,
                    cards: { scope: [TargetScope.TRIGGER_SOURCE] },
                  },
                  {
                    id: 2,
                    type: ActionEffectType.DISCARD_CARD,
                    cards: {
                      scope: [TargetScope.BOARD, TargetScope.FRIENDLY],
                      pickNumber: 2,
                      pickMin: 2,
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
      actions: [
        {
          id: '121-2-2',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [3] },
            },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          emptyStep(1),
          emptyStep(2),
          emptyStep(3),
          emptyStep(4),
          emptyStep(5),
          {
            id: 6,
            effects: [
              {
                id: 1,
                type: ActionEffectType.DISCARD_CARD,
                cards: {
                  scope: [TargetScope.DECK],
                  pickNumber: 999,
                },
              },
            ],
          },
        ],
      },
    },
    {
      id: 3,
      name: 'Attack',
      tags: [CardTag.EVENT],
      illustration: 'cards/121_3.jpg',
      permanent: true,
      passives: [
        {
          id: '121-3-1',
          type: PassiveType.ADD_TRIGGER,
          condition: {
            type: 'not',
            condition: {
              type: 'resource',
              resourceType: ResourceType.WEAPON,
              min: 1,
            },
          },
          trigger: {
            id: '121-3-1',
            type: Trigger.END_OF_TURN,
            actions: [
              {
                id: 1,
                type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
                resourceScopes: ['production'],
                cards: {
                  scope: [TargetScope.BOARD],
                  pickNumber: 1,
                },
                resources: {
                  choice: [
                    { gold: 1 },
                    { wood: 1 },
                    { stone: 1 },
                    { iron: 1 },
                    { weapon: 1 },
                    { goods: 1 },
                  ],
                },
              },
            ],
          },
        },
      ],
      actions: [
        {
          id: '121-3-2',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.FRIENDLY],
                pickNumber: 1,
              },
              stickers: {
                ids: [1, 2, 3, 4, 5, 6],
                pickNumber: 1,
              },
            },
          ],
        },
        {
          id: '121-3-3',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [4] },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Resistance',
      tags: [CardTag.EVENT],
      illustration: 'cards/121_4.png',
      permanent: true,
      actions: [
        {
          id: '121-4-1',
          unlimited: true,
          cost: {
            resources: [{ [ResourceType.WEAPON]: 1 }],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              cards: { scope: [TargetScope.SELF] },
              value: 1,
            },
          ],
        },
        {
          id: '121-4-2',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_GLORY,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.FRIENDLY],
                tags: [CardTag.LAND],
                pickNumber: 1,
              },
              valuePerElement: {
                amount: 1,
                accumulation: true,
              },
            },
            {
              id: 2,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: [TargetScope.SELF] },
            },
          ],
        },
      ],
    },
  ],
};
