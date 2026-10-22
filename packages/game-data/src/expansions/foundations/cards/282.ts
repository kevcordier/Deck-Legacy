import { equipAction } from './equipAction';
import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';

const { STONE, GOODS } = ResourceType;
/** "N stone and goods" (N of each) to mark the box, worth its glory. */
const TRACK: [number, number][] = [
  [1, 2],
  [2, 6],
  [2, 10],
  [2, 15],
  [3, 23],
  [3, 31],
  [3, 40],
  [4, 50],
  [4, 60],
];

const steps: StepDef[] = [
  ...TRACK.map(([count, glory], index) => ({
    id: index + 1,
    cost: { resources: [{ [STONE]: count, [GOODS]: count }] },
    effects: [
      {
        id: 1,
        type: ActionEffectType.SET_CUMULATED,
        cards: { scope: [TargetScope.SELF] },
        value: glory,
      },
    ],
  })),
  { id: 10, cost: { resources: [{ [STONE]: 5, [GOODS]: 5 }] }, effects: [flipTo(1, 2)] },
];

/** Mosaics (Foundations 109): worth the highest marked glory, then a building's equipment. */
export const mosaics: CardDef = {
  id: 282,
  name: 'Mosaics',
  states: [
    {
      id: 1,
      name: 'Mosaics',
      tags: [CardTag.PERMANENT],
      glory: { amount: 0, valuePerElement: { amount: 1, accumulation: true } },
      track: { inOrder: true, steps },
      actions: [
        {
          id: '282-1-1',
          endsTurn: true,
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Mosaics',
      tags: [CardTag.FURNITURE],
      equip: CardTag.BUILDING,
      productions: [{ [GOODS]: 3 }],
      glory: { amount: 75 },
      actions: [equipAction('282-2-1', CardTag.BUILDING, 300)],
    },
  ],
};
