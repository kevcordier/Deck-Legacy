import { riddingTheWoods } from './riddingTheWoods';
import type { ExpansionPack } from './types';

export type { ExpansionPack };

/** Expansions stored in `expansions/<name>/` (the older ones stay in `cards/` and `deck.json`). */
export const expansionPacks: ExpansionPack[] = [riddingTheWoods];
