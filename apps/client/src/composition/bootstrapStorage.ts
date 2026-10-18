import { summarizeSession } from '@application/kingdom/summarizeSession';
import { kingdomStore } from '@composition/kingdomStore';
import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { catalog } from '@infrastructure/catalog/catalog';
import { initI18n } from '@infrastructure/i18n/initI18n';
import { storage } from '@infrastructure/storage/storage';

const REPLAY_OPTIONS = { allowCheats: __DEV__, unrestrictedRewind: false };

/**
 * Loads preferences and kingdoms from the device before the first render, and turns the single
 * save of older versions into a kingdom.
 */
export async function bootstrapStorage(): Promise<void> {
  await storage.hydrate();
  await kingdomStore.hydrateSaves();
  const i18n = initI18n();

  const migrated = kingdomStore.migrateLegacySave(i18n.t('kingdom.defaultName'));
  const kingdom = migrated ? kingdomStore.get(migrated.id) : null;
  if (!migrated || !kingdom) return;
  try {
    const session = GameSession.restore(migrated.id, migrated.events, catalog, REPLAY_OPTIONS);
    kingdomStore.upsert({ ...kingdom, summary: summarizeSession(session) });
  } catch (error) {
    // A corrupted save keeps an empty summary; opening it shows the error screen.
    console.warn('Unable to replay the migrated save', error);
  }
}
