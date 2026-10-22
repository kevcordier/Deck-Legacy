import { SCARVES } from './romanceConstants';
import { ActionEffectType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Romance (Foundations 88): the cover of the foundation, a parchment. */
export const romanceCover: CardDef = {
  id: 261,
  name: 'Romance',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Romance',
      actions: [
        {
          id: '261-1-1',
          actionEffects: [
            {
              // Romance 89–97; 98–105 stay in the box (the discoverable pile)
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [280, 281, 282, 283, 284, 285, 286, 287, 288], autoPick: true },
            },
            {
              id: 2,
              type: ActionEffectType.UNLOCK,
              unlock: {
                stickers: {
                  8: 10,
                  10: 5,
                  11: 3,
                  7: 1,
                  17: 1,
                  ...Object.fromEntries(SCARVES.map(id => [id, 1])),
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
