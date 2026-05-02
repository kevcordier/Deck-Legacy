import { ActionEffectType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

const makeStep = (id: number, gold: number, cumulated: number) => ({
  id,
  icon: 'glory',
  cost: {
    resources: [
      {
        [ResourceType.GOLD]: gold,
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

export const treasury: CardDef = {
  id: 18,
  name: 'Treasury',
  states: [
    {
      id: 1,
      name: 'Treasury',
      permanent: true,
      glory: {
        amount: 0,
        valuePerElement: {
          amount: 1,
          accumulation: true,
        },
      },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/12e629f3-73f2-4edb-91ce-bfb83fa2c2d2/anim=false,width=450,optimized=true/3EDE5F2CA834FA6C31BA7A57752727C762B454184E7180BF089258EA6C299E19.jpeg',
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
          makeStep(2, 2, 2),
          makeStep(3, 3, 3),
          makeStep(4, 4, 5),
          makeStep(5, 5, 7),
          makeStep(6, 6, 10),
          makeStep(7, 7, 14),
          makeStep(8, 8, 19),
          makeStep(9, 9, 25),
          makeStep(10, 10, 32),
          makeStep(11, 11, 40),
          {
            id: 12,
            icon: 'glory',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 12,
                },
              ],
            },
            effects: [
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
      name: 'Extended Treasury',
      permanent: true,
      glory: {
        amount: 50,
        valuePerElement: {
          amount: 1,
          accumulation: true,
        },
      },
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/12e629f3-73f2-4edb-91ce-bfb83fa2c2d2/anim=false,width=450,optimized=true/3EDE5F2CA834FA6C31BA7A57752727C762B454184E7180BF089258EA6C299E19.jpeg',
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
          makeStep(13, 13, 10),
          makeStep(14, 14, 20),
          makeStep(15, 15, 30),
          makeStep(16, 16, 40),
          makeStep(17, 17, 50),
        ],
      },
    },
  ],
};
