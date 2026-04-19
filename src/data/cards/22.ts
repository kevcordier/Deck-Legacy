import { ActionType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const stop3: CardDef = {
  id: 22,
  name: 'Stop',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Stop',
      actions: [
        {
          id: '22-1-1',
          passive: true,
          trigger: Trigger.ON_DISCOVER,
          actions: [
            {
              id: 1,
              type: ActionType.DISCOVER_CARD,
              cards: {
                number: 2,
                scope: TargetScope.DISCOVERY,
                ids: [31, 32, 33, 34],
              },
            },
            {
              id: 2,
              type: ActionType.DESTROY_CARD,
              cards: {
                number: 2,
                scope: TargetScope.DISCOVERY,
                ids: [31, 32, 33, 34],
              },
            },
          ],
        },
      ],
    },
  ],
};
