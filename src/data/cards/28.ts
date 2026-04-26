import { ActionEffectType, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

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
          trigger: Trigger.ON_DISCOVER,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [38],
              },
            },
            {
              id: 2,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [39],
              },
            },
            {
              id: 3,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [40],
              },
            },
            {
              id: 4,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [41],
              },
            },
            {
              id: 5,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [42],
              },
            },
          ],
        },
      ],
    },
  ],
};
