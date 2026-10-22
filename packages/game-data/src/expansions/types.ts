import type { CardDef, ExpansionConfig } from '@deck-legacy/engine/domain/types';

/** Card texts by section (`names`, `actions`, `passives`, `glory`, `tracks`…), then by key. */
export type CardTexts = Record<string, Record<string, string>>;

/**
 * `deck.json` of an expansion folder: one campaign named after the expansion, or several campaigns
 * sharing its logo and numbering (Foundations, EDR-059).
 */
export type ExpansionDeck =
  | (ExpansionConfig & { name: string })
  | { name: string; campaigns: Record<string, ExpansionConfig> };

/** An expansion kept in its own folder: its cards, its `deck.json` and its card texts. */
export type ExpansionPack = {
  deck: ExpansionDeck;
  cards: CardDef[];
  locales: { en: CardTexts; fr: CardTexts };
};
