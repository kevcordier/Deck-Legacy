import { BLESSING } from './churchConstants';
import { ActionEffectType, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Church (Foundations 64): the cover of the foundation, a parchment. */
export const churchCover: CardDef = {
  id: 237,
  name: 'Church',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Church',
      actions: [
        {
          id: '237-1-1',
          actionEffects: [
            {
              // Church 65–70; 71–87 stay in the box (the discoverable pile)
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [256, 257, 258, 259, 260, 261], autoPick: true },
            },
            {
              id: 2,
              type: ActionEffectType.UNLOCK,
              unlock: {
                stickers: { [BLESSING]: 10, 62: 7, 2: 3, 7: 3 },
                resources: [ResourceType.HERB, ResourceType.SCIENCE],
              },
            },
          ],
        },
      ],
    },
  ],
};
