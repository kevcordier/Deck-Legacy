import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

/** "Spend N resources to discover X": offered while X is still in the box. */
export const merchantOffer = (
  id: string,
  resource: ResourceType,
  amount: number,
  entryId: number,
): CardAction => ({
  id,
  endsTurn: true,
  cost: { resources: [{ [resource]: amount }] },
  condition: {
    type: 'cardCount',
    cards: { ids: [entryId], scope: [TargetScope.DISCOVERY] },
    min: 1,
  },
  actionEffects: [{ id: 1, type: ActionEffectType.DISCOVER_CARD, cards: { ids: [entryId] } }],
});

export const merchants: CardDef = {
  id: 150,
  name: 'Merchants',
  states: [
    {
      id: 1,
      name: 'Merchants',
      tags: [CardTag.PERMANENT],
      actions: [
        // Camels, Spices, Furs, Weaving (Merchants 2–5)
        merchantOffer('150-1-1', ResourceType.GOLD, 7, 169),
        merchantOffer('150-1-2', ResourceType.GOODS, 4, 170),
        merchantOffer('150-1-3', ResourceType.IRON, 4, 171),
        merchantOffer('150-1-4', ResourceType.GOODS, 5, 172),
        {
          id: '150-1-5',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            // Brigands (Merchants 19)
            { id: 1, type: ActionEffectType.DISCOVER_CARD, cards: { ids: [186] } },
            {
              id: 2,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Merchants',
      tags: [CardTag.PERMANENT],
      actions: [
        // Grain, Grapes, Fishing, Ether Enhancer (Merchants 6–9)
        merchantOffer('150-2-1', ResourceType.GOLD, 6, 173),
        merchantOffer('150-2-2', ResourceType.WEAPON, 6, 174),
        merchantOffer('150-2-3', ResourceType.GOODS, 5, 175),
        merchantOffer('150-2-4', ResourceType.WOOD, 7, 176),
        {
          id: '150-2-5',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            { id: 1, type: ActionEffectType.DESTROY_CARD, cards: { scope: [TargetScope.SELF] } },
            // Merchants (Merchants 10)
            { id: 2, type: ActionEffectType.DISCOVER_CARD, cards: { ids: [177] } },
          ],
        },
      ],
    },
  ],
};
