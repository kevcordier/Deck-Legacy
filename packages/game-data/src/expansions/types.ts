import type { CardDef, ExpansionConfig } from '@deck-legacy/engine/domain/types';

/** An expansion kept in its own folder: its cards and its `deck.json` (name + configuration). */
export type ExpansionPack = {
  deck: ExpansionConfig & { name: string };
  cards: CardDef[];
};
