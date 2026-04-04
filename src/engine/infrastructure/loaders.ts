/**
 * @file infrastructure/loaders.ts
 * Load game definitions from static JSON files.
 *
 * Layer: Infrastructure — depends only on the domain and static assets.
 */

import { cardsData } from '@data/cards';
import { stickerData, globalStock } from '@data/stickers';
import type { CardDef, Sticker, StickerStock } from '@engine/domain/types';

/** Loads and indexes all card definitions from `cards.json` (key = `card.id`). */
export function loadCardDefs(): Record<number, CardDef> {
  const defs: Record<number, CardDef> = {};
  for (const card of cardsData as unknown as CardDef[]) {
    defs[card.id] = card;
  }
  return defs;
}

/** Loads and indexes sticker definitions from `sticker.json` (key = `sticker.id`). */
export function loadStickerDefs(): Record<number, Sticker> {
  const defs: Record<number, Sticker> = {};
  for (const s of stickerData as unknown as Sticker[]) {
    defs[s.id] = s;
  }
  return defs;
}

/** Returns the global sticker stock as defined in `sticker.json`. */
export function loadInitialStickerStock(): StickerStock {
  return globalStock as unknown as StickerStock;
}
