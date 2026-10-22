import type { ExpansionPack } from '../types';
import { theBlackPlague } from './cards/175';
import { blackPlague } from './cards/176';
import { treatment } from './cards/177';
import { quarantineCard } from './cards/178';
import { rats } from './cards/179';
import { sewer } from './cards/182';
import { contamination } from './cards/183';
import deck from './deck.json';
import en from './locales/cards.en.json';
import fr from './locales/cards.fr.json';

export const foundations: ExpansionPack = {
  locales: { en, fr },
  deck: deck as ExpansionPack['deck'], // JSON strings → enums
  cards: [theBlackPlague, blackPlague, treatment, quarantineCard, rats, sewer, contamination],
};
