import { ActionEffectType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Nobles (Foundations 123): the cover of the foundation, a parchment. */
export const noblesCover: CardDef = {
  id: 296,
  name: 'Nobles',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Nobles',
      actions: [
        {
          id: '296-1-1',
          actionEffects: [
            {
              // Nobles 124–130; 131–139 stay in the box (the discoverable pile)
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [315, 316, 317, 318, 319, 320, 321], autoPick: true },
            },
            {
              id: 2,
              type: ActionEffectType.UNLOCK,
              unlock: { stickers: { 1: 6, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3 } },
            },
          ],
        },
      ],
    },
  ],
};
