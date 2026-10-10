import { ActionEffectType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const stop4: CardDef = {
  id: 28,
  name: 'Stop',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Stop',
      actions: [
        {
          id: '28-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [38, 39, 40, 41, 42],
                pickNumber: 5,
              },
            },
          ],
        },
      ],
    },
  ],
};
