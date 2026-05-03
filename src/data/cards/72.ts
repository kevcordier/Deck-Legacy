import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';

const makeStep = (id: number, persons: number, cumulated: number): StepDef => ({
  id,
  icon: 'glory',
  cost: {
    discard: [
      {
        tags: [CardTag.PERSON],
        pickNumber: persons,
      },
    ],
  },
  effects: [
    {
      id: 1,
      type: ActionEffectType.SET_CUMULATED,
      accumulated: cumulated,
      cards: {
        scope: [TargetScope.SELF],
      },
    },
  ],
});

export const quest: CardDef = {
  id: 72,
  name: 'Quest',
  states: [
    {
      id: 1,
      name: 'Quest',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/851e5ab9-e847-466b-a6be-d3e79ecd894e/450x%3Cauto%3E_so',
      permanent: true,
      glory: {
        amount: 0,
        valuePerElement: {
          amount: 1,
          accumulation: true,
        },
      },
      actions: [
        {
          id: '72-1-1',
          endsTurn: true,
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
      ],
      track: {
        inOrder: true,
        steps: [
          makeStep(1, 1, 1),
          makeStep(2, 2, 3),
          makeStep(3, 2, 6),
          makeStep(4, 3, 10),
          makeStep(5, 3, 14),
          makeStep(6, 4, 20),
          makeStep(7, 5, 27),
          makeStep(8, 6, 35),
          makeStep(9, 7, 45),
        ],
      },
    },
  ],
};
