import type { ExpansionPack } from '../types';
import { merchants } from './cards/150';
import { camels } from './cards/151';
import { spices } from './cards/152';
import { furs } from './cards/153';
import { weaving } from './cards/154';
import { grain } from './cards/155';
import { grapes } from './cards/156';
import { fishing } from './cards/157';
import { etherEnhancer } from './cards/158';
import { secondMerchants } from './cards/159';
import { chicken } from './cards/160';
import { beer } from './cards/161';
import { brewing } from './cards/162';
import { basketry } from './cards/163';
import { vikingWarrior } from './cards/164';
import { mead } from './cards/165';
import { shoemaking } from './cards/166';
import { sheep } from './cards/167';
import { brigands } from './cards/168';
import { chicken20 } from './cards/169';
import { chicken21 } from './cards/170';
import { sheep22 } from './cards/171';
import { sheep23 } from './cards/172';
import { camels24 } from './cards/173';
import { camels25 } from './cards/174';
import deck from './deck.json';
import en from './locales/cards.en.json';
import fr from './locales/cards.fr.json';

export const merchantsPack: ExpansionPack = {
  locales: { en, fr },
  deck,
  cards: [
    merchants,
    camels,
    spices,
    furs,
    weaving,
    grain,
    grapes,
    fishing,
    etherEnhancer,
    secondMerchants,
    chicken,
    beer,
    brewing,
    basketry,
    vikingWarrior,
    mead,
    shoemaking,
    sheep,
    brigands,
    chicken20,
    chicken21,
    sheep22,
    sheep23,
    camels24,
    camels25,
  ],
};
