import { ActionEffectType, TargetScope } from '@engine/domain/enums';
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
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [31, 32, 33, 34],
                pickNumber: 2,
              },
            },
            {
              id: 2,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.DISCOVERY],
                ids: [31, 32, 33, 34],
                pickNumber: 2,
              },
            },
          ],
        },
      ],
    },
  ],
};
