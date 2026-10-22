import { flipTo } from './flipTo';
import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef, StepDef } from '@deck-legacy/engine/domain/types';

const tags = [CardTag.PERSON, CardTag.ELDER, CardTag.MAGE];

// Each completed row of 2 boxes flips the card; its other side destroys an event (3 at most).
const step = (id: number): StepDef => ({ id, effects: id % 2 === 0 ? [flipTo(1, 2)] : [] });

/** Weather Mage (Foundations 31). */
export const weatherMage: CardDef = {
  id: 204,
  name: 'Weather Mage',
  states: [
    {
      id: 1,
      name: 'Weather Mage',
      tags,
      track: { inOrder: true, steps: [1, 2, 3, 4, 5, 6].map(step) },
      actions: [
        {
          id: '204-1-1',
          endsTurn: true,
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Weather Mage',
      tags,
      actions: [
        {
          id: '204-2-1',
          actionEffects: [
            flipTo(1, 1),
            {
              id: 2,
              type: ActionEffectType.DESTROY_CARD,
              cards: { scope: [TargetScope.BOARD], tags: [CardTag.EVENT], pickNumber: 1 },
            },
          ],
        },
      ],
    },
  ],
};
