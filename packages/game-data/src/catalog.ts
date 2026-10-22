import { cardsData } from './cards';
import deckData from './deck.json';
import { expansionPacks, packCampaigns } from './expansions';
import stickerStockData from './stickerStock.json';
import { stickerData } from './stickers';
import type {
  ExpansionConfig,
  ExpansionDeckEntry,
  GameCatalog,
} from '@deck-legacy/engine/domain/types';

export type { GameCatalog };

type DeckData = {
  /** Campaign pack: cards 1–10 are the starting deck, the start of each round discovers the next. */
  campaign: ExpansionDeckEntry[];
  /** Discoverable pack: cards only discovered by card effects. */
  discoverable: ExpansionDeckEntry[];
  /** Mini campaigns of the base game; the engine plays them like expansions. */
  campaigns?: Record<string, ExpansionConfig>;
};

/** Names of the base game mini campaigns, among the catalog `expansions`. */
export const baseCampaignNames: string[] = Object.keys((deckData as DeckData).campaigns ?? {});

export function indexById<T extends { id: number }>(items: readonly T[]): Record<number, T> {
  const byId: Record<number, T> = {};
  for (const item of items) {
    byId[item.id] = item;
  }
  return byId;
}

/**
 * Draw order of the tutorial's first round (starting deck instances), scripted by its steps; the
 * server needs it to verify a kept tutorial (EDR-051).
 */
export const TUTORIAL_DRAW_ORDER = [5, 1, 2, 7, 6, 3, 10, 8, 4, 9];

/** Builds the catalog from the game data of this package. */
export function loadGameCatalog(): GameCatalog {
  const deck = deckData as DeckData;
  return {
    cards: indexById([...cardsData, ...expansionPacks.flatMap(pack => pack.cards)]),
    stickers: indexById(stickerData),
    campaign: deck.campaign,
    discoverable: deck.discoverable,
    expansions: {
      ...deck.campaigns,
      ...Object.fromEntries(expansionPacks.flatMap(packCampaigns)),
    },
    stickerStock: stickerStockData,
    tutorialDrawOrder: TUTORIAL_DRAW_ORDER,
  };
}
