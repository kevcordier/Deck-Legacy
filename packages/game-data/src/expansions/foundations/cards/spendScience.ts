import { ActionEffectType, ResourceType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardAction } from '@deck-legacy/engine/domain/types';

/** "Spend science and keep track of the total": any amount, counted on the card. */
export function spendScience(id: string): CardAction {
  return {
    id,
    unlimited: true,
    cost: { resources: [{ [ResourceType.SCIENCE]: 'any' }] },
    actionEffects: [
      {
        id: 1,
        type: ActionEffectType.ADD_CUMULATED,
        cards: { scope: [TargetScope.SELF] },
        value: 1,
      },
    ],
  };
}
