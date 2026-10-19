import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';

// Each claim boosts the production of 1 person in play.
const makeStep = (id: number, each: number, glory: number): StepDef => ({
  id,
  icon: 'glory',
  cost: { resources: [{ [ResourceType.GOLD]: each, [ResourceType.WOOD]: each }] },
  effects: [
    {
      id: 1,
      type: ActionEffectType.SET_CUMULATED,
      value: glory,
      cards: { scope: [TargetScope.SELF] },
    },
    {
      id: 2,
      type: ActionEffectType.BOOST_CARD,
      cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON] },
    },
  ],
});

export const shoemaking: CardDef = {
  id: 166,
  name: 'Shoemaking',
  states: [
    {
      id: 1,
      name: 'Shoemaking',
      tags: [CardTag.PERMANENT],
      glory: { amount: 0, valuePerElement: { amount: 1, accumulation: true } },
      actions: [
        {
          id: '166-1-1',
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
          makeStep(2, 2, 2),
          makeStep(3, 3, 3),
          makeStep(4, 3, 5),
          makeStep(5, 4, 7),
          makeStep(6, 4, 10),
        ],
      },
    },
  ],
};
