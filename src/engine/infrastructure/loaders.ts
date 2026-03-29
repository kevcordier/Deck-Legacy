/**
 * @file infrastructure/loaders.ts
 * Chargement des définitions de jeu depuis les fichiers JSON statiques.
 *
 * Couche : Infrastructure — dépend uniquement du domaine et des ressources statiques.
 */

import { cardsData } from '@data/cards';
import { stickerData, globalStock } from '@data/stickers';
import type { CardDef, Sticker, StickerStock } from '@engine/domain/types';

/** Charge et indexe toutes les définitions de cartes depuis `cards.json` (clé = `card.id`). */
export function loadCardDefs(): Record<number, CardDef> {
  const defs: Record<number, CardDef> = {};
  for (const card of cardsData as unknown as CardDef[]) {
    defs[card.id] = card;
  }
  return defs;
}

/** Charge et indexe les définitions de stickers depuis `sticker.json` (clé = `sticker.id`). */
export function loadStickerDefs(): Record<number, Sticker> {
  const defs: Record<number, Sticker> = {};
  for (const s of stickerData as unknown as Sticker[]) {
    defs[s.id] = s;
  }
  return defs;
}

/** Retourne le stock global de stickers tel que défini dans `sticker.json`. */
export function loadInitialStickerStock(): StickerStock {
  return globalStock as unknown as StickerStock;
}
