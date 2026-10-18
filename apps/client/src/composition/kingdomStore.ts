import { LocalKingdomStore } from '@infrastructure/storage/LocalKingdomStore';
import { storage } from '@infrastructure/storage/storage';

/** The kingdoms and saves of this device. */
export const kingdomStore = new LocalKingdomStore(storage);
