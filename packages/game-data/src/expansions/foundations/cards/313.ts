import { ActionEffectType, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Mechanics (Foundations 140): the cover of the foundation, a parchment. */
export const mechanicsCover: CardDef = {
  id: 313,
  name: 'Mechanics',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Mechanics',
      actions: [
        {
          id: '313-1-1',
          actionEffects: [
            {
              // Mechanics 141–150; 151–156 stay in the box (the discoverable pile)
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [332, 333, 334, 335, 336, 337, 338, 339, 340, 341],
                autoPick: true,
              },
            },
            {
              id: 2,
              type: ActionEffectType.UNLOCK,
              unlock: {
                stickers: { 1: 4, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 },
                resources: [ResourceType.SCIENCE],
              },
            },
          ],
        },
      ],
    },
  ],
};
