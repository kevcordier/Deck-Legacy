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
  ],
};
