import { BLESSED } from './churchConstants';
import { flipTo } from './flipTo';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const TAGS = [CardTag.STATE, CardTag.PERMANENT];
/** The medals written on the card: their sum, kept on the card. */
const writtenMedals = { amount: 0, valuePerElement: { amount: 1, accumulation: true } };

/** Church Authority (Foundations 82): 6 medals written with discarded blessed cards. */
export const churchAuthority: CardDef = {
  id: 255,
  name: 'Church Authority',
  states: [
    {
      id: 1,
      name: 'Church Authority',
      tags: TAGS,
      glory: writtenMedals,
      track: {
        inOrder: true,
        steps: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
      },
      actions: [
        {
          // Write twice the number of discarded cards in the next medal
          id: '255-1-1',
          unlimited: true,
          cost: { discard: [{ ...BLESSED, pickMin: 1, pickMax: 99 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_CUMULATED,
              cards: { scope: [TargetScope.SELF] },
              value: 1,
              valuePerElement: { amount: 2, cards: { scope: [TargetScope.DISCARDED] } },
            },
            { id: 2, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
        { id: '255-1-2', trigger: Trigger.ON_TRACK_END, actionEffects: [flipTo(1, 2)] },
      ],
    },
    {
      id: 2,
      name: 'Church Authority',
      tags: TAGS,
      glory: writtenMedals,
      actions: [
        {
          id: '255-2-1',
          unlimited: true,
          cost: { discard: [{ ...BLESSED, pickNumber: 1 }] },
          actionEffects: [
            { id: 1, type: ActionEffectType.ADD_RESOURCES, resources: { choice: [{ any: 1 }] } },
          ],
        },
      ],
    },
  ],
};
