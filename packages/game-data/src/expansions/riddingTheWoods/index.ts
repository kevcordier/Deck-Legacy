import type { ExpansionPack } from '../types';
import { aCertainLady } from './cards/122';
import { robbinLeader } from './cards/123';
import { hoodedBandit } from './cards/124';
import { robberForest } from './cards/125';
import { terrifiedTown } from './cards/126';
import { greenBandit } from './cards/127';
import { hugeRobber } from './cards/128';
import { largeRobberCamp } from './cards/129';
import { fortGrounds } from './cards/130';
import { taxCollector } from './cards/131';
import { robberVeteran } from './cards/132';
import { archeryContest } from './cards/133';
import { lousyGuard } from './cards/134';
import { treasureWagon } from './cards/135';
import { powerfulPrince } from './cards/136';
import { denseRobberCamp } from './cards/137';
import { cliffyRobberCamp } from './cards/138';
import { robberSaboteur } from './cards/139';
import { rebelliousMonk } from './cards/140';
import { bardOfThePeople } from './cards/141';
import { rescuer } from './cards/142';
import { secondRescuer } from './cards/143';
import { oldOakTree } from './cards/144';
import { druidCamp } from './cards/145';
import { hilltop } from './cards/146';
import { keeperOfSecrets } from './cards/147';
import { sheriff } from './cards/148';
import { woodsTreasury } from './cards/149';
import { outpostConstruction } from './cards/150';
import deck from './deck.json';

export const riddingTheWoods: ExpansionPack = {
  deck: deck as ExpansionPack['deck'], // JSON strings → ResourceType
  cards: [
    aCertainLady,
    robbinLeader,
    hoodedBandit,
    robberForest,
    terrifiedTown,
    greenBandit,
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
