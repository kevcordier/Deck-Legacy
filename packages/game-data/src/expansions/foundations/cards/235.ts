import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardSelector } from '@deck-legacy/engine/domain/types';

const TAB = 60;
const tabbedInDeck: CardSelector = { scope: [TargetScope.DECK], stickerIds: [TAB] };

/** Stone Roads (Foundations 62): tabbed cards are played from the deck. */
export const stoneRoads: CardDef = {
  id: 235,
  name: 'Stone Roads',
  states: [
    {
      id: 1,
      name: 'Stone Roads',
      tags: [CardTag.INVENTION, CardTag.PERMANENT],
      actions: [
        {
          id: '235-1-1',
          endsTurn: true,
          cost: { resources: [{ [ResourceType.STONE]: 3 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.ANY],
                tags: [CardTag.LAND, CardTag.BUILDING],
                withoutStickerIds: [TAB],
                pickNumber: 1,
              },
              stickers: { ids: [TAB] },
            },
          ],
        },
        {
          id: '235-1-2',
          unlimited: true,
          condition: { type: 'cardCount', cards: tabbedInDeck, min: 1 },
          actionEffects: [
            { id: 1, type: ActionEffectType.PLAY_CARD, cards: { ...tabbedInDeck, pickNumber: 1 } },
          ],
        },
      ],
    },
  ],
};
