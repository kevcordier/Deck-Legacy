import { flipTo } from './flipTo';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Lightning Strike / The Chosen One (Foundations 44). */
export const lightningStrike: CardDef = {
  id: 217,
  name: 'Lightning Strike',
  states: [
    {
      id: 1,
      name: 'Lightning Strike',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '217-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.CHOOSE_EFFECT,
              effects: [
                {
                  id: 1,
                  type: ActionEffectType.SEQUENCE,
                  effects: [
                    {
                      id: 1,
                      type: ActionEffectType.DESTROY_CARD,
                      cards: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 1 },
                    },
                    flipTo(2, 2),
                  ],
                },
                {
                  id: 2,
                  type: ActionEffectType.DISCARD_CARD,
                  cards: { scope: [TargetScope.TOP_OF_DECK], pickNumber: 3 },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'The Chosen One',
      tags: [CardTag.PERSON],
      glory: { amount: 2 },
      actions: [
        {
          // Selected in a purge: saves another card selected in it
          id: '217-2-1',
          trigger: Trigger.ON_PURGE,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.SAVE_FROM_PURGE,
              cards: { scope: [TargetScope.PURGE_SELECTED], pickNumber: 1 },
            },
          ],
        },
      ],
    },
  ],
};
