import { highestMarked } from './highestMarked';
import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Glory of each box; discard a card with at least (index + 1) total production to mark it. */
const GLORY = [2, 5, 8, 12, 16, 22, 30, 40, 50, 75];

/** Wealth Contest (Foundations 138). */
export const wealthContest: CardDef = {
  id: 311,
  name: 'Wealth Contest',
  states: [
    {
      id: 1,
      name: 'Wealth Contest',
      tags: [CardTag.PERMANENT],
      ...highestMarked(GLORY, index => ({
        discard: [{ having: { minProduction: index + 1 }, pickNumber: 1 }],
      })),
      actions: [
        {
          id: '311-1-1',
          endsTurn: true,
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
  ],
};
