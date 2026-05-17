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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/198e4f96-be8c-4e1e-8ba3-9aa2b7d094b9/450x%3Cauto%3E_so',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/f822506d-abc0-4888-9bca-fd4acb4ad15b/450x%3Cauto%3E_so',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/6dc4b5dc-7815-4e3b-a096-0c53c75a5439/450x%3Cauto%3E_so',
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
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/a816fa23-8b65-465a-b2c3-7a468a8d0fca/450x%3Cauto%3E_so',
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
