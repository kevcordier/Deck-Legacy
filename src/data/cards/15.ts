import { ActionEffectType, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const stop1: CardDef = {
  id: 15,
  name: 'Stop',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Stop',
      actions: [
        {
          id: '15-1-1',
          trigger: Trigger.ON_DISCOVER,
          actionEffects: [
            {
              id: 2,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [25, 26, 27, 24],
              },
              pickNumber: 4,
            },
          ],
        },
      ],
    },
  ],
};
