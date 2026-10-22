import { flipTo } from './flipTo';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

const personsInDeck: CardSelector = { scope: [TargetScope.DECK], tags: [CardTag.PERSON] };

/** Pilgrimage (Foundations 80): block persons each round; 50 in total turn it into Devotion. */
export const pilgrimage: CardDef = {
  id: 253,
  name: 'Pilgrimage',
  states: [
    {
      id: 1,
      name: 'Pilgrimage',
      tags: [CardTag.PERMANENT],
      actions: [
        {
          id: '253-1-1',
          trigger: Trigger.START_OF_ROUND,
          optional: true,
          condition: { type: 'cardCount', cards: personsInDeck, min: 1 },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: { ...personsInDeck, pickMin: 1, pickMax: 99 },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_CUMULATED,
              cards: { scope: [TargetScope.SELF] },
              value: 1,
              valuePerElement: { amount: 1, cards: { scope: [TargetScope.LAST_SELECTED] } },
            },
          ],
        },
        {
          // The persons blocked this round go back to the deck next round.
          id: '253-1-2',
          trigger: Trigger.END_OF_ROUND,
          condition: {
            type: 'cardCount',
            cards: { scope: [TargetScope.BLOCKED_BY_THIS] },
            min: 1,
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UNBLOCK_CARD,
              cards: { scope: [TargetScope.BLOCKED_BY_THIS], autoPick: true },
            },
          ],
        },
        {
          id: '253-1-3',
          trigger: Trigger.END_OF_ROUND,
          condition: { type: 'accumulation', min: 50 },
          actionEffects: [flipTo(1, 2)],
        },
      ],
    },
    {
      id: 2,
      name: 'Devotion',
      tags: [CardTag.EVENT],
      glory: { amount: 50 },
      actions: [
        {
          id: '253-2-1',
          cost: { discard: [{ tags: [CardTag.PERSON], pickNumber: 1 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { choice: [{ any: 1 }] },
              repeat: 2,
            },
          ],
        },
      ],
    },
  ],
};
