import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

/** Discard cards (inventions, or with science production) and add them to the count. */
const tally = (id: string, discard: CardSelector): CardAction => ({
  id,
  unlimited: true,
  cost: { discard: [{ ...discard, pickMin: 1, pickMax: 99 }] },
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.ADD_CUMULATED,
      cards: { scope: [TargetScope.SELF] },
      value: 1,
      valuePerElement: { amount: 1, cards: { scope: [TargetScope.DISCARDED] } },
    },
  ],
});

/** Calculations (Foundations 155): worth 1 glory per mark, up to 100. */
export const calculations: CardDef = {
  id: 328,
  name: 'Calculations',
  states: [
    {
      id: 1,
      name: 'Calculations',
      tags: [CardTag.PERMANENT],
      glory: { amount: 0, valuePerElement: { amount: 1, accumulation: true, max: 100 } },
      actions: [
        tally('328-1-1', { tags: [CardTag.INVENTION] }),
        tally('328-1-2', { produces: [ResourceType.SCIENCE] }),
      ],
    },
  ],
};
