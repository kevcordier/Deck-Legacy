import { cardsData } from '@data/cards';
import globalStock from '@data/stickerStock.json';
import { stickerData } from '@data/stickers';
import {
  loadCardDefs,
  loadInitialStickerStock,
  loadStickerDefs,
} from '@engine/infrastructure/loaders';
import { describe, expect, it } from 'vitest';

describe('loaders', () => {
  it('indexes card definitions by id', () => {
    const defs = loadCardDefs();

    expect(Object.keys(defs)).toHaveLength(cardsData.length);
    expect(defs[cardsData[0].id]).toBe(cardsData[0]);
  });

  it('indexes sticker definitions by id', () => {
    const defs = loadStickerDefs();

    expect(Object.keys(defs)).toHaveLength(stickerData.length);
    expect(defs[stickerData[0].id]).toBe(stickerData[0]);
  });

  it('returns the initial sticker stock', () => {
    expect(loadInitialStickerStock()).toBe(globalStock);
  });
});
