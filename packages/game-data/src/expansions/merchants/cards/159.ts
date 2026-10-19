import { merchantOffer } from './150';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const secondMerchants: CardDef = {
  id: 159,
  name: 'Merchants',
  states: [
    {
      id: 1,
      name: 'Merchants',
      tags: [CardTag.PERMANENT],
      actions: [
        // Chicken, Beer, Brewing, Basketry (Merchants 11–14)
        merchantOffer('159-1-1', ResourceType.GOLD, 7, 178),
        merchantOffer('159-1-2', ResourceType.GOODS, 4, 179),
        merchantOffer('159-1-3', ResourceType.GOODS, 5, 180),
        merchantOffer('159-1-4', ResourceType.WOOD, 7, 181),
        {
          id: '159-1-5',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
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
        // Viking Warrior, Mead, Shoemaking, Sheep (Merchants 15–18)
        merchantOffer('159-2-1', ResourceType.GOLD, 6, 182),
        merchantOffer('159-2-2', ResourceType.GOODS, 6, 183),
        merchantOffer('159-2-3', ResourceType.IRON, 5, 184),
        merchantOffer('159-2-4', ResourceType.GOODS, 7, 185),
        {
          id: '159-2-5',
          trigger: Trigger.END_OF_ROUND,
          // The expansion is over: its 4th and last round ends (expansionMaxRound).
          actionEffects: [
            { id: 1, type: ActionEffectType.DESTROY_CARD, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
  ],
};
