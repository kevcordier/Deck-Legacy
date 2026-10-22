import { destroySelf } from './destroySelf';
import { schoolStates } from './schoolStates';
import { SCIENCE, SCIENCE_CARDS } from './scienceConstants';
import { ActionEffectType, CardTag } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** School (Foundations 49): teaches the persons, then discovers the University. */
export const school49: CardDef = {
  id: 222,
  name: 'Small School',
  states: [
    ...schoolStates(222),
    {
      id: 4,
      name: 'Renowned School',
      tags: [CardTag.BUILDING],
      productions: [{ [SCIENCE]: 1 }],
      glory: { amount: 6 },
      actions: [
        {
          id: '222-4-1',
          cost: { resources: [{ [SCIENCE]: 3 }] },
          actionEffects: [
            destroySelf(1),
            {
              id: 2,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [SCIENCE_CARDS.university] },
            },
          ],
        },
      ],
    },
  ],
};
