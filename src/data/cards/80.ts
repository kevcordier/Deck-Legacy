import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';

const makeStep = (id: number): StepDef => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.ADD_CUMULATED,
      value: 1,
      cards: {
        scope: [TargetScope.SELF],
      },
    },
  ],
});

export const astronomer: CardDef = {
  id: 80,
  name: 'Astronomer',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Astronomer',
      tags: [CardTag.PERSON],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/de27f2e5-7bbd-474a-9a51-1dfa0c9d532a/450x%3Cauto%3E_so',
      glory: {
        amount: 0,
        valuePerElement: {
          amount: 2,
          accumulation: true,
        },
      },
      actions: [
        {
          id: '80-1-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
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
          makeStep(1),
          makeStep(2),
          makeStep(3),
          makeStep(4),
          makeStep(5),
          makeStep(6),
          makeStep(7),
          makeStep(8),
          makeStep(9),
          makeStep(10),
          makeStep(11),
          makeStep(12),
          makeStep(13),
          makeStep(14),
          makeStep(15),
          makeStep(16),
        ],
      },
    },
    {
      id: 2,
      name: 'Astrologist',
      tags: [CardTag.PERSON],
      illustration:
        'https://image-b2.civitai.com/file/civitai-media-cache/3a01687e-ca3c-494d-8495-3fdc90563a9a/450x%3Cauto%3E_so_hm',
      productions: [{ [ResourceType.WEAPON]: 1 }],
      actions: [
        {
          id: '80-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 1,
                  type: ActionEffectType.PLACE_CARD_IN_PILE,
                  cards: {
                    scope: [TargetScope.BOARD],
                    pickMin: 0,
                    pickMax: 3,
                  },
                  deck: 'draw',
                  position: 'top',
                },
                {
                  id: 2,
                  type: ActionEffectType.PLACE_CARD_IN_PILE,
                  cards: {
                    scope: [TargetScope.BOARD],
                    pickMin: 0,
                    pickMax: 3,
                  },
                  deck: 'draw',
                  position: 'bottom',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
