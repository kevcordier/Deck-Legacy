import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';

// Same pattern as Weaving (Merchants 5), paid with seafaring cards in play.
const makeStep = (id: number, seafaring: number, glory: number): StepDef => ({
  id,
  icon: 'glory',
  cost: {
    discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.SEAFARING], pickNumber: seafaring }],
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

export const fishing: CardDef = {
  id: 157,
  name: 'Fishing',
  states: [
    {
      id: 1,
      name: 'Fishing',
      tags: [CardTag.PERMANENT],
      glory: { amount: 0, valuePerElement: { amount: 1, accumulation: true } },
      actions: [
        {
          id: '157-1-1',
          endsTurn: true,
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          makeStep(1, 1, 1),
          makeStep(2, 1, 4),
          makeStep(3, 1, 7),
          makeStep(4, 2, 10),
          makeStep(5, 2, 14),
          makeStep(6, 2, 19),
          makeStep(7, 3, 25),
          makeStep(8, 3, 32),
          makeStep(9, 3, 40),
          makeStep(10, 4, 50),
        ],
      },
    },
  ],
};
