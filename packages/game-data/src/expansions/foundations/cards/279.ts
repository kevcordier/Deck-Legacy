import { ActionEffectType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Artisans (Foundations 106): the cover of the foundation, a parchment. */
export const artisansCover: CardDef = {
  id: 279,
  name: 'Artisans',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Artisans',
      actions: [
        {
          id: '279-1-1',
          actionEffects: [
            {
              // Artisans 107–114; 115–122 stay in the box (the discoverable pile)
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [298, 299, 300, 301, 302, 303, 304, 305], autoPick: true },
            },
            { id: 2, type: ActionEffectType.UNLOCK, unlock: { stickers: { 10: 5 } } },
          ],
        },
      ],
    },
  ],
};
