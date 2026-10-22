import { foundations } from './foundations';
import { merchantsPack } from './merchants';
import { riddingTheWoods } from './riddingTheWoods';
import type { ExpansionPack } from './types';

export { packCampaigns } from './packCampaigns';
export type { CardTexts, ExpansionDeck, ExpansionPack } from './types';

/** Expansions stored in `expansions/<name>/` (the base game mini campaigns stay in `cards/` and `deck.json`). */
export const expansionPacks: ExpansionPack[] = [riddingTheWoods, merchantsPack, foundations];
