import { ActionEffectType, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardSelector } from '@deck-legacy/engine/domain/types';

/** "Cross out 1 production on a card": the player picks the card, then one of its productions. */
export function crossOutProduction(id: number, cards: CardSelector): ActionEffect {
  return {
    id,
    type: ActionEffectType.REMOVE_RESOURCE_ON_CARD,
    resourceScopes: ['production'],
    cards: { produces: Object.values(ResourceType), pickNumber: 1, ...cards },
    resources: { choice: [{ any: 1 }] },
  };
}
