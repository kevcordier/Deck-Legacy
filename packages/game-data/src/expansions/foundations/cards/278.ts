import { gainAny } from './gainAny';
import { matchingScarves } from './matchingScarves';
import { KNIGHT, LADY } from './romanceConstants';
import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Chivalry / Brotherhood (Foundations 105): a side chosen when discovered. */
export const chivalry: CardDef = {
  id: 278,
  name: 'Chivalry',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Chivalry',
      tags: [CardTag.EVENT],
      glory: { amount: 50 },
      actions: [
        {
          id: '278-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                // Matching scarves: 6 instead of 4
                ...matchingScarves([gainAny(3, 6)]),
                {
                  id: 7,
                  type: ActionEffectType.SEQUENCE,
                  condition: {
                    type: 'and',
                    conditions: [
                      {
                        type: 'cardCount',
                        cards: { ...KNIGHT, scope: [TargetScope.BOARD] },
                        min: 1,
                      },
                      { type: 'cardCount', cards: { ...LADY, scope: [TargetScope.BOARD] }, min: 1 },
                    ],
                  },
                  effects: [
                    {
                      id: 1,
                      type: ActionEffectType.DISCARD_CARD,
                      cards: { ...KNIGHT, scope: [TargetScope.BOARD], pickNumber: 1 },
                    },
                    {
                      id: 2,
                      type: ActionEffectType.DISCARD_CARD,
                      cards: { ...LADY, scope: [TargetScope.BOARD], pickNumber: 1 },
                    },
                    gainAny(3, 4),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Brotherhood',
      tags: [CardTag.PERMANENT],
      glory: { amount: 30 },
      actions: [
        {
          id: '278-2-1',
          unlimited: true,
          cost: { discard: [{ ...KNIGHT, pickNumber: 2 }] },
          actionEffects: [gainAny(1, 3)],
        },
      ],
    },
  ],
};
