import { undiscover } from './undiscover';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

// Sewer (Foundations 9), on its negative side: you cannot use the activated effects on Rats.
const SEWER = 200;

/** Rats (Foundations 6, 7, 8, 11–15): printed with the infection icon; they keep coming back. */
export const rats: CardDef = {
  id: 179,
  name: 'Rats',
  states: [
    {
      id: 1,
      name: 'Rats',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -2 },
      actions: [
        {
          id: '179-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.TOP_OF_DECK] },
            },
          ],
        },
        {
          id: '179-1-2',
          condition: {
            type: 'not',
            condition: {
              type: 'cardCount',
              cards: { ids: [SEWER], scope: [TargetScope.BOARD, TargetScope.ENEMY] },
              min: 1,
            },
          },
          cost: { discard: [{ produces: [ResourceType.WEAPON], pickNumber: 1 }] },
          actionEffects: undiscover(1, 'The Black Plague'),
        },
      ],
    },
  ],
};
