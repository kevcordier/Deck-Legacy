import { crossOutProduction } from './crossOutProduction';
import { CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Corruption (Foundations 124). */
export const corruption: CardDef = {
  id: 297,
  name: 'Corruption',
  states: [
    {
      id: 1,
      name: 'Corruption',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '297-1-1',
          trigger: Trigger.END_OF_TURN,
          condition: {
            type: 'cardCount',
            cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON] },
            min: 1,
          },
          actionEffects: [crossOutProduction(1, { scope: [TargetScope.DISCARD] })],
        },
      ],
    },
  ],
};
