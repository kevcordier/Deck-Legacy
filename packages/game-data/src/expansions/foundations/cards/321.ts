import { flipTo } from './flipTo';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Breakthrough / Backlash (Foundations 148): a side chosen when discovered. */
export const breakthrough: CardDef = {
  id: 321,
  name: 'Breakthrough',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Breakthrough',
      tags: [CardTag.EVENT],
      actions: [
        {
          // Use a ⌛ or ✓ effect on a person, without discarding it nor ending the turn
          id: '321-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.USE_CARD_ACTION,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.PERMANENTS],
                tags: [CardTag.PERSON],
                pickNumber: 1,
              },
              usableActions: 'activated',
            },
            flipTo(2, 2),
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Backlash',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '321-2-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD, TargetScope.FRIENDLY], pickNumber: 2 },
            },
            flipTo(2, 1),
          ],
        },
      ],
    },
  ],
};
