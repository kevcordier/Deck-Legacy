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
      value: cumulated,
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
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e6094f93-eaed-4dfc-94cd-504288ba59da/original=true,quality=90/9406B4DAC1E3366487E84BF3125C829DF46845F06B56F04E12F7E5C5159C6ACB.jpeg',
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
