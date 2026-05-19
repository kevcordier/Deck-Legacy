import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';

const makeStep = (id: number): StepDef => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.ADD_CUMULATED,
      cards: { scope: [TargetScope.SELF] },
      value: 1,
    },
  ],
});

export const inventor: CardDef = {
  id: 26,
  name: 'Inventor',
  states: [
    {
      id: 1,
      name: 'Inventor',
      tags: [CardTag.PERSON],
      illustration: 'cards/26_1.jpg',
      glory: {
        amount: 0,
        valuePerElement: {
          amount: 5,
          accumulation: true,
        },
      },
      track: {
        inOrder: true,
        steps: [makeStep(1), makeStep(2), makeStep(3)],
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
      illustration: 'cards/26_2.jpg',
      glory: {
        amount: 0,
        valuePerElement: {
          amount: 5,
          accumulation: true,
        },
      },
      actions: [
        {
          id: '26-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [1] },
            },
            {
              id: 2,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
            {
              id: 3,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 1,
                  type: ActionEffectType.DISCOVER_CARD,
                  cards: { ids: [97, 98, 99] },
                },
                {
                  id: 2,
                  type: ActionEffectType.ADD_RESOURCES,
                  resources: {
                    [ResourceType.GOLD]: 1,
                    [ResourceType.WOOD]: 1,
                    [ResourceType.STONE]: 1,
                    [ResourceType.IRON]: 1,
                    [ResourceType.WEAPON]: 1,
                    [ResourceType.GOODS]: 1,
                  },
                  valuePerElement: {
                    amount: 1,
                    accumulation: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
