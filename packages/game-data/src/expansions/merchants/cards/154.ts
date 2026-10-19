import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';

// Same pattern as the base game Army (card 17): worth the highest glory marked.
const makeStep = (id: number, gold: number, glory: number): StepDef => ({
  id,
  icon: 'glory',
  cost: {
    resources: [{ [ResourceType.GOLD]: gold }],
    discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 1 }],
  },
  effects: [
    {
      id: 1,
      type: ActionEffectType.SET_CUMULATED,
      value: glory,
      cards: { scope: [TargetScope.SELF] },
    },
  ],
});

export const weaving: CardDef = {
  id: 154,
  name: 'Weaving',
  states: [
    {
      id: 1,
      name: 'Weaving',
      tags: [CardTag.PERMANENT],
      glory: { amount: 0, valuePerElement: { amount: 1, accumulation: true } },
      actions: [
        {
          id: '154-1-1',
          endsTurn: true,
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          makeStep(1, 2, 1),
          makeStep(2, 2, 4),
          makeStep(3, 3, 7),
          makeStep(4, 3, 10),
          makeStep(5, 4, 14),
          makeStep(6, 4, 19),
          makeStep(7, 5, 25),
          makeStep(8, 5, 32),
          makeStep(9, 6, 40),
          makeStep(10, 7, 50),
        ],
      },
    },
  ],
};
