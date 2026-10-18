import { kingdomStore } from './kingdomStore';
import { syncService } from './syncService';
import { AbandonKingdom } from '@application/kingdom/AbandonKingdom';
import { CreateKingdom } from '@application/kingdom/CreateKingdom';
import { DiscardLocalSave } from '@application/kingdom/DiscardLocalSave';
import { MigrateLegacySave } from '@application/kingdom/MigrateLegacySave';
import { RenameKingdom } from '@application/kingdom/RenameKingdom';
import { SaveGame } from '@application/kingdom/SaveGame';
import { catalog } from '@infrastructure/catalog/catalog';
import { randomUUID } from 'expo-crypto';

/** The player's kingdom operations, wired on this device's store and sync. */
export const kingdomUseCases = {
  create: new CreateKingdom(kingdomStore, randomUUID),
  rename: new RenameKingdom(kingdomStore, syncService),
  abandon: new AbandonKingdom(kingdomStore, syncService),
  saveGame: new SaveGame(kingdomStore, syncService),
  discardLocalSave: new DiscardLocalSave(kingdomStore),
  migrateLegacySave: new MigrateLegacySave(kingdomStore, catalog),
};
