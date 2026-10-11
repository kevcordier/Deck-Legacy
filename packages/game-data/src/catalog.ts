import { cardsData } from './cards';
import deckData from './deck.json';
import { expansionPacks } from './expansions';
import stickerStockData from './stickerStock.json';
import { stickerData } from './stickers';
import type {
  ExpansionConfig,
  ExpansionDeckEntry,
  GameCatalog,
} from '@deck-legacy/engine/domain/types';

export type { GameCatalog };

type DeckData = {
  deck: ExpansionDeckEntry[];
  expansions?: Record<string, ExpansionConfig>;
};

export function indexById<T extends { id: number }>(items: readonly T[]): Record<number, T> {
  const byId: Record<number, T> = {};
  for (const item of items) {
    byId[item.id] = item;
  }
  return byId;
}

/** Builds the catalog from the game data of this package. */
export function loadGameCatalog(): GameCatalog {
  const deck = deckData as DeckData;
  return {
    cards: indexById([...cardsData, ...expansionPacks.flatMap(pack => pack.cards)]),
    stickers: indexById(stickerData),
    deck: deck.deck,
    expansions: {
      ...deck.expansions,
      ...Object.fromEntries(expansionPacks.map(({ deck: { name, ...config } }) => [name, config])),
    },
    stickerStock: stickerStockData,
  };
}
