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
import { naturesRevenge } from './cards/203';
import { weatherMage } from './cards/204';
import { jaguar } from './cards/205';
import { cursedLands } from './cards/206';
import { badOmen } from './cards/207';
import { thunderstorm } from './cards/208';
import { volcanicEruption } from './cards/209';
import { cityFire } from './cards/210';
import { ratsFamine } from './cards/211';
import { hurricane } from './cards/212';
import { bearCub } from './cards/213';
import { drought } from './cards/214';
import { earthquake } from './cards/215';
import { lightningStrike } from './cards/217';
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
    naturesRevenge,
    weatherMage,
    jaguar,
    cursedLands,
    badOmen,
    thunderstorm,
    volcanicEruption,
    cityFire,
    ratsFamine,
    hurricane,
    bearCub,
    drought,
    earthquake,
    lightningStrike,
  ],
};
