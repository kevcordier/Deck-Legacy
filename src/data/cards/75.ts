import { ActionEffectType, TargetScope } from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';

const makeStep = (id: number, iron: number, cumulated: number): StepDef => ({
  id,
  cost: { resources: [{ iron }] },
  icon: 'glory',
  effects: [
    {
      id: 1,
      type: ActionEffectType.SET_CUMULATED,
      cards: { scope: [TargetScope.SELF] },
      value: cumulated,
    },
  ],
});

export const jewellery: CardDef = {
  id: 75,
  name: 'Jewellery',
  states: [
    {
      id: 1,
      name: 'Jewellery',
      permanent: true,
      illustration: 'cards/75_1.jpg',
      glory: { amount: 0, valuePerElement: { accumulation: true, amount: 1 } },
      actions: [
        {
          id: '75-1-1',
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: {
                scope: [TargetScope.SELF],
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                goods: 5,
              },
            },
          ],
        },
      ],
      track: {
        inOrder: true,
        steps: [
          makeStep(1, 1, 1),
          makeStep(2, 2, 2),
          makeStep(3, 3, 3),
          makeStep(4, 4, 5),
          makeStep(5, 5, 7),
          makeStep(6, 6, 10),
          makeStep(7, 7, 14),
          makeStep(8, 8, 20),
          makeStep(9, 9, 28),
          makeStep(10, 10, 40),
        ],
      },
    },
  ],
};
