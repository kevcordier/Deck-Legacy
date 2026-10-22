import { SCIENCE } from './scienceConstants';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Laughing Stock (Foundations 47): −1 glory each time it is played with science in play. */
export const laughingStock: CardDef = {
  id: 220,
  name: 'Laughing Stock',
  states: [
    {
      id: 1,
      name: 'Laughing Stock',
      tags: [CardTag.EVENT],
      negative: true,
      glory: { amount: 0, valuePerElement: { amount: -1, accumulation: true } },
      actions: [
        {
          id: '220-1-1',
          trigger: Trigger.ON_PLAY,
          condition: {
            type: 'cardCount',
            cards: { scope: [TargetScope.BOARD], produces: [SCIENCE] },
            min: 1,
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              cards: { scope: [TargetScope.SELF] },
              value: 1,
            },
          ],
        },
      ],
    },
  ],
};
