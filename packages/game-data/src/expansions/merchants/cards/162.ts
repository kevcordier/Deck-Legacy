import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';

// Discard as many persons as gold spent; each claim also gains 5 goods.
const makeStep = (id: number, gold: number, glory: number): StepDef => ({
  id,
  icon: 'glory',
  cost: {
    resources: [{ [ResourceType.GOLD]: gold }],
    discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: gold }],
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

export const brewing: CardDef = {
  id: 162,
  name: 'Brewing',
  states: [
    {
      id: 1,
      name: 'Brewing',
      tags: [CardTag.PERMANENT],
      glory: { amount: 0, valuePerElement: { amount: 1, accumulation: true } },
      actions: [
        {
          id: '162-1-1',
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
          makeStep(2, 2, 2),
          makeStep(3, 2, 4),
          makeStep(4, 3, 8),
          makeStep(5, 3, 16),
          makeStep(6, 4, 32),
        ],
      },
    },
  ],
};
