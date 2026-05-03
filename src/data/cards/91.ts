import { ActionEffectType, CardTag, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';

function makeStep(id: number): StepDef {
  return {
    id,
    effects: [
      {
        id: 1,
        type: ActionEffectType.ADD_CUMULATED,
        cards: {
          scope: [TargetScope.SELF],
        },
        accumulated: 1,
      },
    ],
  };
}

export const camelot: CardDef = {
  id: 91,
  name: 'Camelot',
  states: [
    {
      id: 1,
      name: 'Camelot',
      tags: [CardTag.BUILDING],
      glory: { amount: 15 },
      upgrade: [
        {
          cost: { resources: [{ wood: 2, stone: 4 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Camelot',
      tags: [CardTag.BUILDING],
      glory: { amount: 20 },
      upgrade: [
        {
          cost: { resources: [{ wood: 1, stone: 3, iron: 2 }] },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Camelot',
      tags: [CardTag.BUILDING],
      glory: { amount: 30 },
      upgrade: [
        {
          cost: { resources: [{ stone: 6, iron: 3 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Camelot',
      tags: [CardTag.BUILDING],
      glory: { amount: 40, valuePerElement: { accumulation: true, amount: 5 } },
      actions: [
        {
          id: '91-4-1',
          trigger: Trigger.END_OF_ROUND,
          optional: true,
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
          makeStep(8),
        ],
      },
    },
  ],
};
