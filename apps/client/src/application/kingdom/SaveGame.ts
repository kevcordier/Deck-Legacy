import { summarizeSession } from './summarizeSession';
import type { KingdomRepository } from '@application/ports/KingdomRepository';
import type { SyncService } from '@application/sync/SyncService';
import type { GameSession } from '@deck-legacy/engine/application/session/GameSession';

/** Saves the game being played on this device, then pushes it once the player pauses. */
export class SaveGame {
  constructor(
    private readonly kingdoms: KingdomRepository,
    private readonly sync: Pick<SyncService, 'schedule'>,
  ) {}

  execute(session: GameSession): void {
    this.kingdoms.saveGame(
      session.id,
      session.getEvents(),
      session.getCardNames(),
      summarizeSession(session),
    );
    this.sync.schedule();
  }
}
