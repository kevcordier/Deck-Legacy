import { cardTexts, loadGameCatalog } from '../src';
import { type CardTexts, expansionPacks } from '../src/expansions';
import baseEn from '../src/locales/cards.en.json';
import baseFr from '../src/locales/cards.fr.json';
import { describe, expect, it } from 'vitest';

const keysOf = (texts: CardTexts) =>
  Object.entries(texts).flatMap(([section, entries]) =>
    Object.keys(entries).map(k => `${section}.${k}`),
  );

const files: [string, CardTexts, CardTexts][] = [
  ['base game', baseEn, baseFr],
  ...expansionPacks.map(({ deck, locales }): [string, CardTexts, CardTexts] => [
    deck.name,
    locales.en,
    locales.fr,
  ]),
];

describe('card texts', () => {
  it.each(files)('%s has the same keys in English and French', (_name, en, fr) => {
    expect(keysOf(fr).sort((a, b) => a.localeCompare(b))).toEqual(
      keysOf(en).sort((a, b) => a.localeCompare(b)),
    );
  });

  it('never defines a key in two files', () => {
    const keys = files.flatMap(([, en]) => keysOf(en));
    expect(keys.filter((key, i) => keys.indexOf(key) !== i)).toEqual([]);
  });

  it('names every card state', () => {
    const names = Object.values(loadGameCatalog().cards).flatMap(card =>
      card.states.map(state => state.name),
    );
    expect(names.filter(name => cardTexts.en.names?.[name] === undefined)).toEqual([]);
  });
});
