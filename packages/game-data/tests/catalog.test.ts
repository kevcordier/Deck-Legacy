import { indexById, loadGameCatalog } from '../src';
import { cardsData } from '../src/cards';
import { stickerData } from '../src/stickers';
import { describe, expect, it } from 'vitest';

describe('loadGameCatalog', () => {
  it('indexes every card and sticker by id', () => {
    const catalog = loadGameCatalog();

    expect(Object.keys(catalog.cards)).toHaveLength(cardsData.length);
    expect(Object.keys(catalog.stickers)).toHaveLength(stickerData.length);
    expect(catalog.deck.length).toBeGreaterThan(10);
  });

  it('references only known cards in the decks', () => {
    const catalog = loadGameCatalog();
    const decks = [catalog.deck, ...Object.values(catalog.expansions).map(e => e.deck)];

    for (const entry of decks.flat()) {
      expect(catalog.cards[entry.cardId]).toBeDefined();
    }
  });

  it('uses unique instance ids across the base deck and expansions', () => {
    const catalog = loadGameCatalog();
    const ids = [catalog.deck, ...Object.values(catalog.expansions).map(e => e.deck)]
      .flat()
      .map(entry => entry.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('indexById', () => {
  it('keys items by their id', () => {
    expect(indexById([{ id: 4 }, { id: 9 }])).toEqual({ 4: { id: 4 }, 9: { id: 9 } });
  });
});
