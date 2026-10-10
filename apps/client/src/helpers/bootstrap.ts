import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { catalog } from '@helpers/catalog';
import { initI18n } from '@helpers/i18n';
import { summarizeSession } from '@helpers/kingdom';
import { getKingdom, hydrateSaves, migrateLegacySave, upsertKingdom } from '@services/persistence';
import { hydrateStorage } from '@services/storage';

const REPLAY_OPTIONS = { allowCheats: __DEV__, unrestrictedRewind: false };

/**
 * Loads preferences and kingdoms from the device before the first render, and turns the single
 * save of older versions into a kingdom.
 */
export async function bootstrapStorage(): Promise<void> {
  await hydrateStorage();
  await hydrateSaves();
  const i18n = initI18n();

  const migrated = migrateLegacySave(i18n.t('kingdom.defaultName'));
  const kingdom = migrated ? getKingdom(migrated.id) : null;
  if (!migrated || !kingdom) return;
  try {
    const session = GameSession.restore(migrated.id, migrated.events, catalog, REPLAY_OPTIONS);
    upsertKingdom({ ...kingdom, summary: summarizeSession(session) });
  } catch (error) {
    // A corrupted save keeps an empty summary; opening it shows the error screen.
    console.warn('Unable to replay the migrated save', error);
  }
}
