import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const villa: CardDef = {
  id: 66,
  name: 'Villa',
  states: [
    {
      id: 1,
      name: 'Villa',
      tags: [CardTag.BUILDING],
      illustration: 'cards/66_1.jpg',
      actions: [
        {
          id: '66-1-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: [
              {
                scope: [TargetScope.SELF],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
                pickMin: 0,
                pickMax: 1,
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Estate',
      tags: [CardTag.BUILDING],
      illustration: 'cards/66_2.jpg',
      glory: { amount: 3 },
      actions: [
        {
          id: '66-2-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: [
              {
                scope: [TargetScope.SELF],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
                pickMin: 0,
                pickMax: 2,
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.WOOD]: 2,
                [ResourceType.STONE]: 4,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Mansion',
      tags: [CardTag.BUILDING],
      illustration: 'cards/66_3.jpg',
      glory: { amount: 7 },
      actions: [
        {
          id: '66-3-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: [
              {
                scope: [TargetScope.SELF],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD],
                pickMin: 0,
                pickMax: 1,
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.STONE]: 2,
                [ResourceType.GOLD]: 4,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Palace',
      tags: [CardTag.BUILDING],
      illustration: 'cards/66_4.jpg',
      glory: { amount: 12 },
      actions: [
        {
          id: '66-4-1',
          trigger: Trigger.END_OF_TURN,
          optional: true,
          cost: {
            discard: [
              {
                scope: [TargetScope.SELF],
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_BOARD_EFFECT,
              cards: {
                scope: [TargetScope.BOARD],
                pickMin: 0,
                pickMax: 2,
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
          ],
        },
      ],
    },
  ],
};
