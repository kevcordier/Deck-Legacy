import { indexById, loadGameCatalog } from '../src';
import { cardsData } from '../src/cards';
import { expansionPacks } from '../src/expansions';
import { stickerData } from '../src/stickers';
import { describe, expect, it } from 'vitest';

describe('loadGameCatalog', () => {
  it('indexes every card and sticker by id', () => {
    const catalog = loadGameCatalog();

    const packCards = expansionPacks.flatMap(pack => pack.cards);
    expect(Object.keys(catalog.cards)).toHaveLength(cardsData.length + packCards.length);
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

  it('registers every expansion folder under its name', () => {
    const catalog = loadGameCatalog();

    for (const { deck } of expansionPacks) {
      expect(catalog.expansions[deck.name]?.deck).toEqual(deck.deck);
    }
  });

  it('only adds known stickers with expansions', () => {
    const catalog = loadGameCatalog();

    for (const { stickers = {} } of Object.values(catalog.expansions)) {
      for (const id of Object.keys(stickers)) {
        expect(catalog.stickers[Number(id)]).toBeDefined();
      }
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
