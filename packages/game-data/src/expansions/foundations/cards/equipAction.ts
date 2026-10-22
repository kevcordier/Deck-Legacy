import { ActionEffectType, type CardTag, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardSelector } from '@deck-legacy/engine/domain/types';

/**
 * "Equip <keyword>": place this card under a card in play with the keyword. Not equipped, it has
 * no production nor effects; equipped, they count on its holder. Equipping does not end the turn.
 */
export function equipAction(id: string, keyword: CardTag, instanceId: number): CardAction {
  const holders: CardSelector = {
    scope: [TargetScope.BOARD, TargetScope.PERMANENTS],
    tags: [keyword],
    equipped: false,
  };
  return {
    id,
    // Equipping keeps the equipment in play (an activated effect would discard it)
    unlimited: true,
    condition: {
      type: 'and',
      conditions: [
        {
          type: 'cardCount',
          cards: {
            ids: [instanceId],
            scope: [TargetScope.BOARD, TargetScope.SELF],
            equipped: false,
          },
          min: 1,
        },
        { type: 'cardCount', cards: holders, min: 1 },
      ],
    },
    actionEffects: [{ id: 1, type: ActionEffectType.EQUIP, cards: { ...holders, pickNumber: 1 } }],
  };
}
