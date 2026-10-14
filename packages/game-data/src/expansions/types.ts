import type { CardDef, ExpansionConfig } from '@deck-legacy/engine/domain/types';

/** Card texts by section (`names`, `actions`, `passives`, `glory`, `tracks`…), then by key. */
export type CardTexts = Record<string, Record<string, string>>;

/** An expansion kept in its own folder: its cards, its `deck.json` and its card texts. */
export type ExpansionPack = {
  deck: ExpansionConfig & { name: string };
  cards: CardDef[];
  locales: { en: CardTexts; fr: CardTexts };
};
