import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

export const hilltop: CardDef = {
  id: 145,
  name: 'Hilltop',
  states: [
    {
      id: 1,
      name: 'Hilltop',
      tags: [CardTag.LAND],
      illustration: 'cards/145_1.jpg',
      productions: [{ [ResourceType.GOLD]: 1 }],
      upgrade: [{ cost: { resources: [{ [ResourceType.STONE]: 3 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Hill Monument',
      tags: [CardTag.LAND],
      illustration: 'cards/145_2.jpg',
      productions: [{ [ResourceType.GOLD]: 1 }],
      glory: { amount: 4 },
      upgrade: [{ cost: { resources: [{ [ResourceType.STONE]: 6 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Hill Megalith',
      tags: [CardTag.LAND],
      illustration: 'cards/145_3.jpg',
      productions: [{ [ResourceType.GOLD]: 1 }],
      glory: { amount: 10 },
      actions: [
        {
          id: '145-3-1',
          endsTurn: true,
          cost: { resources: [{ [ResourceType.GOODS]: 4 }] },
          // Keeper of Secrets (Ridding the Woods 26)
          actionEffects: [{ id: 1, type: ActionEffectType.DISCOVER_CARD, cards: { ids: [164] } }],
        },
      ],
      // the printed upgrade box is empty: free upgrade
      upgrade: [{ cost: {}, upgradeTo: 4 }],
    },
    {
      id: 4,
      name: 'Ceremony',
      tags: [CardTag.EVENT],
      illustration: 'cards/145_4.jpg',
      glory: { amount: 10 },
      actions: [
        {
          id: '145-4-1',
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.FRIENDLY],
                pickNumber: 5,
                pickMin: 5,
              },
            },
            {
              id: 2,
              type: ActionEffectType.ADD_STICKER,
              cards: { scope: [TargetScope.LAST_SELECTED], pickNumber: 1 },
              stickers: { ids: [10], pickNumber: 1 },
            },
            {
              id: 3,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [3] },
            },
          ],
        },
      ],
    },
  ],
};
