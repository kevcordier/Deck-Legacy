import { ActionEffectType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';

const makeStep = (id: number, stone: number, cumulated: number): StepDef => ({
  id,
  icon: 'glory',
  cost: {
    resources: [
      {
        [ResourceType.STONE]: stone,
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

export const aPerfectTower: CardDef = {
  id: 73,
  name: 'A Perfect Tower',
  states: [
    {
      id: 1,
      name: 'A Perfect Tower',
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/138c7d1b-985b-4b4e-8f44-2fe5767bd630/450x%3Cauto%3E_so',
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
          id: '73-1-1',
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
          makeStep(1, 1, 3),
          makeStep(2, 2, 6),
          makeStep(3, 3, 10),
          makeStep(4, 4, 15),
          makeStep(5, 5, 22),
          makeStep(6, 6, 30),
          makeStep(7, 7, 38),
          makeStep(8, 8, 48),
          makeStep(9, 9, 60),
          makeStep(10, 10, 75),
        ],
      },
    },
  ],
};
