import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Contamination (Foundations 10): printed with the infection icon. */
export const contamination: CardDef = {
  id: 183,
  name: 'Contamination',
  states: [
    {
      id: 1,
      name: 'Contamination',
      tags: [CardTag.EVENT],
      negative: true,
      actions: [
        {
          id: '183-1-1',
          trigger: Trigger.ON_PLAY,
          optional: true,
          cost: { destroy: { scope: [TargetScope.BOARD], tags: [CardTag.PERSON], pickNumber: 1 } },
          actionEffects: [
            { id: 1, type: ActionEffectType.DESTROY_CARD, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
  ],
};
