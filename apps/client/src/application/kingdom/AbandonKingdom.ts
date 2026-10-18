import type { KingdomRepository } from '@application/ports/KingdomRepository';
import type { SyncService } from '@application/sync/SyncService';

/** Deletes a kingdom on this device and abandons it on the server (now or at the next sync). */
export class AbandonKingdom {
  constructor(
    private readonly kingdoms: KingdomRepository,
    private readonly sync: Pick<SyncService, 'schedule'>,
  ) {}

  execute(id: string): void {
    this.kingdoms.abandon(id);
    this.sync.schedule();
  }
}
