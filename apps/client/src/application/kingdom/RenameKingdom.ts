import type { KingdomRepository } from '@application/ports/KingdomRepository';
import type { SyncService } from '@application/sync/SyncService';

/** Renames a kingdom; a started one is pushed again so the server gets the new name. */
export class RenameKingdom {
  constructor(
    private readonly kingdoms: KingdomRepository,
    private readonly sync: Pick<SyncService, 'schedule'>,
  ) {}

  execute(id: string, name: string): void {
    this.kingdoms.rename(id, name);
    this.sync.schedule();
  }
}
