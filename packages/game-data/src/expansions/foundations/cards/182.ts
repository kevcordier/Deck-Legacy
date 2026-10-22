import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Sewer (Foundations 9): purgeable once flipped, after the Black Plague. */
export const sewer: CardDef = {
  id: 182,
  name: 'Sewer',
  states: [
    {
      // Negative side: the Rats (179) check it before their activated effect
      id: 1,
      name: 'Sewer',
      tags: [CardTag.BUILDING],
      negative: true,
      actions: [
        {
          id: '182-1-1',
          endsTurn: true,
          condition: {
            type: 'not',
            condition: { type: 'expansionActive', name: 'The Black Plague' },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Sewer',
      tags: [CardTag.BUILDING],
      glory: { amount: 2 },
      actions: [
        {
          id: '182-2-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 1,
                  type: ActionEffectType.DISCARD_CARD,
                  cards: { scope: [TargetScope.BOARD], pickNumber: 1 },
                },
                {
                  id: 2,
                  type: ActionEffectType.DISCARD_CARD,
                  cards: { scope: [TargetScope.TOP_OF_DECK] },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
