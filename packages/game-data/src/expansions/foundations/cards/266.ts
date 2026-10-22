import { ActionEffectType, CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Endurance (Foundations 93). */
export const endurance: CardDef = {
  id: 266,
  name: 'Endurance',
  states: [
    {
      id: 1,
      name: 'Endurance',
      tags: [CardTag.EVENT],
      actions: [
        {
          id: '266-1-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.ENEMY],
                notStaying: true,
                pickNumber: 1,
              },
            },
          ],
        },
      ],
    },
  ],
};
