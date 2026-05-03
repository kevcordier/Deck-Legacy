import { ActionEffectType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';

const makeStep = (id: number, weapon: number, cumulated: number): StepDef => ({
  id,
  icon: 'glory',
  cost: {
    resources: [
      {
        [ResourceType.WEAPON]: weapon,
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

export const army: CardDef = {
  id: 17,
  name: 'Army',
  states: [
    {
      id: 1,
      name: 'Army',
      permanent: true,
      glory: {
        amount: 0,
        valuePerElement: {
          amount: 1,
          accumulation: true,
        },
      },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c482b4a9-396c-4bdd-a45d-3a8866cec739/original=true,quality=90/2025-07-18-235304_Flux%20CopaxTimeless_xplus4_0.jpeg',
      actions: [
        {
          id: '17_1_1',
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
          makeStep(2, 2, 4),
          makeStep(3, 3, 7),
          makeStep(4, 4, 10),
          makeStep(5, 5, 14),
          makeStep(6, 6, 19),
          makeStep(7, 7, 25),
          makeStep(8, 8, 32),
          makeStep(9, 9, 40),
          {
            id: 10,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 10,
                },
              ],
            },
            effects: [
              {
                id: 1,
                type: ActionEffectType.DISCOVER_CARD,
                cards: {
                  ids: [135],
                },
              },
              {
                id: 2,
                type: ActionEffectType.UPGRADE_CARD,
                cards: {
                  scope: [TargetScope.SELF],
                },
                states: [2],
              },
            ],
          },
        ],
      },
    },
    {
      id: 2,
      name: 'Grand Army',
      permanent: true,
      glory: {
        amount: 50,
        valuePerElement: {
          amount: 1,
          accumulation: true,
        },
      },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/c482b4a9-396c-4bdd-a45d-3a8866cec739/original=true,quality=90/2025-07-18-235304_Flux%20CopaxTimeless_xplus4_0.jpeg',
      actions: [
        {
          id: '17_2_1',
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
          makeStep(11, 10, 10),
          makeStep(12, 10, 20),
          makeStep(13, 12, 30),
          makeStep(14, 12, 40),
          makeStep(15, 15, 50),
        ],
      },
    },
  ],
};
