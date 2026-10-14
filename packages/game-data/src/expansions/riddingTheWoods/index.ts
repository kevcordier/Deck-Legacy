import type { ExpansionPack } from '../types';
import { aCertainLady } from './cards/122';
import { robbinLeader } from './cards/123';
import { hoodedBandit } from './cards/124';
import { robberForest } from './cards/125';
import { terrifiedTown } from './cards/126';
import { hugeRobber } from './cards/127';
import { largeRobberCamp } from './cards/128';
import { fortGrounds } from './cards/129';
import { taxCollector } from './cards/130';
import { robberVeteran } from './cards/131';
import { archeryContest } from './cards/132';
import { lousyGuard } from './cards/133';
import { treasureWagon } from './cards/134';
import { powerfulPrince } from './cards/135';
import { denseRobberCamp } from './cards/136';
import { cliffyRobberCamp } from './cards/137';
import { robberSaboteur } from './cards/138';
import { rebelliousMonk } from './cards/139';
import { bardOfThePeople } from './cards/140';
import { rescuer } from './cards/141';
import { secondRescuer } from './cards/142';
import { oldOakTree } from './cards/143';
import { druidCamp } from './cards/144';
import { hilltop } from './cards/145';
import { keeperOfSecrets } from './cards/146';
import { sheriff } from './cards/147';
import { woodsTreasury } from './cards/148';
import { outpostConstruction } from './cards/149';
import deck from './deck.json';
import en from './locales/cards.en.json';
import fr from './locales/cards.fr.json';

export const riddingTheWoods: ExpansionPack = {
  locales: { en, fr },
  deck: deck as ExpansionPack['deck'], // JSON strings → ResourceType
  cards: [
    aCertainLady,
    robbinLeader,
    hoodedBandit,
    robberForest,
    terrifiedTown,
    hugeRobber,
    largeRobberCamp,
    fortGrounds,
    taxCollector,
    robberVeteran,
    archeryContest,
    lousyGuard,
    treasureWagon,
    powerfulPrince,
    denseRobberCamp,
    cliffyRobberCamp,
    robberSaboteur,
    rebelliousMonk,
    bardOfThePeople,
    rescuer,
    secondRescuer,
    oldOakTree,
    druidCamp,
    hilltop,
    keeperOfSecrets,
    sheriff,
    woodsTreasury,
    outpostConstruction,
  ],
};
