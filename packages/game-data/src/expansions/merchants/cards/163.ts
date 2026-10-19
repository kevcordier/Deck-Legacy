import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';

// Discard 1 person and spend the wood; each claim also gains 5 goods.
const makeStep = (id: number, wood: number, glory: number): StepDef => ({
  id,
  icon: 'glory',
  cost: {
    resources: [{ [ResourceType.WOOD]: wood }],
    discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 1 }],
  },
  effects: [
    {
      id: 1,
      type: ActionEffectType.SET_CUMULATED,
      value: glory,
      cards: { scope: [TargetScope.SELF] },
    },
    { id: 2, type: ActionEffectType.ADD_RESOURCES, resources: { [ResourceType.GOODS]: 5 } },
  ],
});

export const basketry: CardDef = {
  id: 163,
  name: 'Basketry',
  states: [
    {
      id: 1,
      name: 'Basketry',
      tags: [CardTag.PERMANENT],
      glory: { amount: 0, valuePerElement: { amount: 1, accumulation: true } },
      actions: [
        {
          id: '163-1-1',
          unlimited: true,
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          makeStep(1, 2, 1),
          makeStep(2, 3, 2),
          makeStep(3, 4, 4),
          makeStep(4, 5, 8),
          makeStep(5, 5, 16),
          makeStep(6, 6, 32),
        ],
      },
    },
  ],
};
