import { indexById, loadGameCatalog } from '../src';
import { cardsData } from '../src/cards';
import { expansionPacks } from '../src/expansions';
import { stickerData } from '../src/stickers';
import type { ExpansionConfig } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const entries = (config: Pick<ExpansionConfig, 'campaign' | 'discoverable'>) => [
  ...config.campaign,
  ...(config.discoverable ?? []),
];

describe('loadGameCatalog', () => {
  it('indexes every card and sticker by id', () => {
    const catalog = loadGameCatalog();

    const packCards = expansionPacks.flatMap(pack => pack.cards);
    expect(Object.keys(catalog.cards)).toHaveLength(cardsData.length + packCards.length);
    expect(Object.keys(catalog.stickers)).toHaveLength(stickerData.length);
    expect(catalog.campaign.length).toBeGreaterThan(10);
  });

  it('references only known cards in the decks', () => {
    const catalog = loadGameCatalog();
    const decks = [entries(catalog), ...Object.values(catalog.expansions).map(entries)];

    for (const entry of decks.flat()) {
      expect(catalog.cards[entry.cardId]).toBeDefined();
    }
  });

  it('registers every expansion folder under its name', () => {
    const catalog = loadGameCatalog();

    for (const { deck } of expansionPacks) {
      const config = catalog.expansions[deck.name];
      expect(config && entries(config)).toEqual(entries(deck));
      expect(config?.expansion).toBe(deck.name);
    }
  });

  it('gives the expansion cards global ids and their own printed numbers', () => {
    const catalog = loadGameCatalog();
    const woods = catalog.expansions['Ridding the Woods'];

    expect(woods?.campaign[0]).toEqual({ id: 139, cardId: 122, number: 1 });
    expect(woods?.campaign).toHaveLength(25);
    expect(woods?.discoverable?.map(entry => entry.number)).toEqual([26, 27, 28, 29]);
    expect(woods?.onStart?.discover?.ids).toEqual([139, 140, 141, 142, 143]);
  });

  it('uses unique card ids across the base game and expansions', () => {
    const ids = [...cardsData, ...expansionPacks.flatMap(pack => pack.cards)].map(card => card.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('splits the base game into its campaign (1–70) and discoverable (71+) packs', () => {
    const catalog = loadGameCatalog();

    expect(catalog.campaign.map(entry => entry.id)).toEqual(
      Array.from({ length: 70 }, (_, i) => i + 1),
    );
    expect(catalog.discoverable.every(entry => entry.id > 70)).toBe(true);
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
    const ids = [entries(catalog), ...Object.values(catalog.expansions).map(entries)]
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
