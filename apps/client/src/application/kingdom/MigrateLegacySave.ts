import { summarizeSession } from './summarizeSession';
import type { KingdomRepository } from '@application/ports/KingdomRepository';
import { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import type { GameCatalog } from '@deck-legacy/engine/domain/types';

const REPLAY_OPTIONS = { allowCheats: __DEV__, unrestrictedRewind: false };

/** Turns the single save of older versions into a kingdom, so no player loses their game. */
export class MigrateLegacySave {
  constructor(
    private readonly kingdoms: KingdomRepository,
    private readonly catalog: GameCatalog,
  ) {}

  execute(defaultName: string): void {
    const migrated = this.kingdoms.migrateLegacySave(defaultName);
    const kingdom = migrated ? this.kingdoms.get(migrated.id) : null;
    if (!migrated || !kingdom) return;
    try {
      const session = GameSession.restore(
        migrated.id,
        migrated.events,
        this.catalog,
        REPLAY_OPTIONS,
      );
      this.kingdoms.upsert({ ...kingdom, summary: summarizeSession(session) });
    } catch (error) {
      // A corrupted save keeps an empty summary; opening it shows the error screen.
      console.warn('Unable to replay the migrated save', error);
    }
  }
}
