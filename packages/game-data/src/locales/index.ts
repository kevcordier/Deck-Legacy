import { type CardTexts, expansionPacks } from '../expansions';
import en from './cards.en.json';
import fr from './cards.fr.json';

function mergeTexts(base: CardTexts, extras: CardTexts[]): CardTexts {
  const merged: CardTexts = {};
  for (const texts of [base, ...extras]) {
    for (const [section, entries] of Object.entries(texts)) {
      merged[section] = { ...merged[section], ...entries };
    }
  }
  return merged;
}

/** Card texts (i18next `cards` namespace): the base game, then every expansion folder. */
export const cardTexts: Record<'en' | 'fr', CardTexts> = {
  en: mergeTexts(
    en,
    expansionPacks.map(pack => pack.locales.en),
  ),
  fr: mergeTexts(
    fr,
    expansionPacks.map(pack => pack.locales.fr),
  ),
};
