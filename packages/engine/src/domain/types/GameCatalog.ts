import type { CardDef } from './Card';
import type { ExpansionConfig, ExpansionDeckEntry } from './GameState';
import type { Sticker, StickerStock } from './Sticker';

/** Static game definitions the engine needs to run a game. */
export type GameCatalog = {
  cards: Record<number, CardDef>;
  stickers: Record<number, Sticker>;
  /** Base game campaign pack: its first cards are the starting deck. */
  campaign: ExpansionDeckEntry[];
  /** Base game discoverable pack. */
  discoverable: ExpansionDeckEntry[];
  expansions: Record<string, ExpansionConfig>;
  stickerStock: StickerStock;
};
