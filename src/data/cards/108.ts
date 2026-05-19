import { ActionEffectType, CardTag, PassiveType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

function makeStep(id: number): StepDef {
  return {
    id,
    effects: [
      {
        id: 1,
        type: ActionEffectType.ADD_CUMULATED,
        value: 1,
      },
    ],
  };
}

export const largeTemple: CardDef = {
  id: 108,
  name: 'Large Temple',
  states: [
    {
      id: 1,
      name: 'Large Temple',
      tags: [CardTag.BUILDING],
      illustration: 'cards/108_1.jpg',
      glory: { amount: 18 },
      actions: [
        {
          id: '108-1-1',
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
                pickMax: 5,
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
                gold: 3,
                goods: 3,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Ornate Temple',
      tags: [CardTag.BUILDING],
      illustration: 'cards/108_2.jpg',
      glory: { amount: 22 },
      actions: [
        {
          id: '108-2-1',
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
                pickMax: 5,
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
                gold: 3,
                stone: 3,
                goods: 3,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Legendary Temple',
      tags: [CardTag.BUILDING],
      illustration: 'cards/108_3.jpg',
      glory: { amount: 28 },
      actions: [
        {
          id: '108-3-1',
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
                pickMax: 5,
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
                goods: 8,
              },
            ],
          },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Temple of Light',
      tags: [CardTag.BUILDING],
      illustration: 'cards/108_4.jpg',
      glory: { amount: 30, emptyValues: 1 },
      actions: [
        {
          id: '108-4-1',
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
                pickMax: 5,
              },
              effect: CardPassives[PassiveType.STAY_IN_PLAY],
            },
          ],
        },
        {
          id: '108-4-2',
          endsTurn: true,
          cost: {
            resources: [
              {
                goods: 4,
              },
            ],
          },
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
        {
          id: '108-4-3',
          trigger: Trigger.ON_PURGE,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_GLORY,
              cards: {
                scope: [TargetScope.SELF],
              },
              valuePerElement: { amount: 10, accumulation: true },
            },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [makeStep(1), makeStep(2), makeStep(3), makeStep(4), makeStep(5)],
      },
    },
  ],
};
