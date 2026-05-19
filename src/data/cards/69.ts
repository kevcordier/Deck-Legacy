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

export const shrine: CardDef = {
  id: 69,
  name: 'Shrine',
  states: [
    {
      id: 1,
      name: 'Shrine',
      tags: [CardTag.LAND],
      illustration: 'cards/69_1.jpg',
      glory: { amount: 3 },
      actions: [
        {
          id: '69-1-1',
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
      illustration: 'cards/69_2.jpg',
      glory: { amount: 5 },
      actions: [
        {
          id: '69-2-1',
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
      illustration: 'cards/69_3.jpg',
      glory: { amount: 9 },
      actions: [
        {
          id: '69-3-1',
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
                pickMax: 3,
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
      illustration: 'cards/69_4.jpg',
      glory: { amount: 15 },
      actions: [
        {
          id: '69-4-1',
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
                pickMax: 4,
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
          ],
        },
      ],
    },
  ],
};
