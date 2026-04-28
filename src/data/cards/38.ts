import { ActionEffectType, TargetScope, Trigger } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const stop5: CardDef = {
  id: 38,
  name: 'Stop',
  parchmentCard: true,
  states: [
    {
      id: 1,
      name: 'Stop',
      actions: [
        {
          id: '38-1-1',
          trigger: Trigger.ON_DISCOVER,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [48, 49, 50, 51],
              },
              pickNumber: 2,
            },
            {
              id: 2,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                ids: [48, 49, 50, 51],
                scope: [TargetScope.DISCOVERY],
              },
              pickNumber: 2,
            },
          ],
        },
      ],
    },
  ],
};
