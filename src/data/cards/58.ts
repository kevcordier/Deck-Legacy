import { ActionEffectType, PassiveType, Trigger } from '@engine/domain/enums';
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
              type: ActionEffectType.ADD_BOARD_EFFECT,
              effect: {
                id: '58-1-1',
                global: true,
                type: PassiveType.ADD_TRIGGER,
                trigger: {
                  id: '58-1-1',
                  type: Trigger.END_OF_ROUND,
                  actions: [
                    {
                      id: 1,
                      type: ActionEffectType.END_GAME,
                    },
                  ],
                },
              },
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
