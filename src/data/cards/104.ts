import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

const makeStep = (id: number): StepDef => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.ADD_CUMULATED,
      cards: { scope: [TargetScope.SELF] },
      value: 1,
    },
  ],
});

export const kingAlahar: CardDef = {
  id: 104,
  name: 'King Alahar',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'King Alahar',
      illustration: 'cards/104_1.jpg',
      tags: [CardTag.PERSON],
      glory: { amount: -5 },
      productions: [{ [ResourceType.WEAPON]: 2 }],
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
    {
      id: 2,
      name: 'Queen Jemimah',
      tags: [CardTag.PERSON, CardTag.LADY],
      illustration: 'cards/104_2.jpg',
      glory: {
        amount: 0,
        valuePerElement: {
          amount: 3,
          accumulation: true,
        },
      },
      actions: [
        {
          id: '104-2-1',
          cost: {
            discard: [
              {
                scope: [TargetScope.BOARD],
                tags: [CardTag.PERSON],
                having: { minGlory: 5 },
                pickNumber: 1,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
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
        ],
      },
    },
  ],
};
