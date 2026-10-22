import type { ExpansionPack } from '../types';
import { theBlackPlague } from './cards/175';
import { blackPlague } from './cards/176';
import { treatment } from './cards/177';
import { quarantineCard } from './cards/178';
import { rats } from './cards/179';
import { sewer } from './cards/182';
import { contamination } from './cards/183';
import { invasion } from './cards/189';
import { siegeTower } from './cards/190';
import { enemyArcher } from './cards/191';
import { enemyTroop } from './cards/192';
import { infiltrator } from './cards/194';
import { enemyPrince } from './cards/195';
import { enemyCommander } from './cards/196';
import { enemySpearman } from './cards/198';
import { cityAblaze } from './cards/200';
import deck from './deck.json';
import en from './locales/cards.en.json';
import fr from './locales/cards.fr.json';

export const foundations: ExpansionPack = {
  locales: { en, fr },
  deck: deck as ExpansionPack['deck'], // JSON strings → enums
  cards: [
    theBlackPlague,
    blackPlague,
    treatment,
    quarantineCard,
    rats,
    sewer,
    contamination,
    invasion,
    siegeTower,
    enemyArcher,
    enemyTroop,
    infiltrator,
    enemyPrince,
    enemyCommander,
    enemySpearman,
    cityAblaze,
  ],
};
