import { flipTo } from './flipTo';
import { ActionEffectType, CardTag, TargetScope, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const twoPersons = { tags: [CardTag.PERSON], pickNumber: 2 };

/** Chalice of Malice (Foundations 130): a negative item, then a brew worth 3 per box. */
export const chaliceOfMalice: CardDef = {
  id: 303,
  name: 'Chalice of Malice',
  states: [
    {
      id: 1,
      name: 'Chalice of Malice',
      tags: [CardTag.ITEM],
      negative: true,
      actions: [
        {
          id: '303-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { ...twoPersons, scope: [TargetScope.BOARD] },
            },
            flipTo(2, 2),
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Brew that is True',
      tags: [CardTag.ITEM],
      glory: { amount: 0, valuePerElement: { amount: 3, markedSteps: true } },
      track: {
        inOrder: true,
        steps: Array.from({ length: 10 }, (_, index) => ({ id: index + 1 })),
      },
      actions: [
        {
          id: '303-2-1',
          cost: { discard: [twoPersons] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
            flipTo(2, 1),
          ],
        },
      ],
    },
  ],
};
