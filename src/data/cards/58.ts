import { ActionEffectType } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const stop6: CardDef = {
  id: 58,
  name: 'Stop',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Stop',
      actions: [
        {
          id: '58-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.SET_LAST_ROUND,
            },
            {
              id: 2,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [69, 70],
                pickNumber: 2,
              },
            },
          ],
        },
      ],
    },
  ],
};
