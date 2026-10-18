import { kingdomUseCases } from './kingdomUseCases';
import { kingdomStore } from '@composition/kingdomStore';
import { initI18n } from '@infrastructure/i18n/initI18n';
import { storage } from '@infrastructure/storage/storage';

/**
 * Loads preferences and kingdoms from the device before the first render, and turns the single
 * save of older versions into a kingdom.
 */
export async function bootstrapStorage(): Promise<void> {
  await storage.hydrate();
  await kingdomStore.hydrateSaves();
  const i18n = initI18n();

  kingdomUseCases.migrateLegacySave.execute(i18n.t('kingdom.defaultName'));
}
