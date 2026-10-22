import { ActionEffectType, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Science (Foundations 45): the cover of the foundation, a parchment. */
export const scienceCover: CardDef = {
  id: 218,
  name: 'Science',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Science',
      actions: [
        {
          id: '218-1-1',
          actionEffects: [
            {
              // Science 46–53; 54–63 stay in the box (the discoverable pile)
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [237, 238, 239, 240, 241, 242, 243, 244], autoPick: true },
            },
            {
              id: 2,
              type: ActionEffectType.UNLOCK,
              unlock: {
                stickers: { 62: 10, 4: 5, 6: 5, 60: 1 },
                resources: [ResourceType.SCIENCE],
              },
            },
          ],
        },
      ],
    },
  ],
};
