import type { KingdomRepository } from '@application/ports/KingdomRepository';

/**
 * Removes a corrupted kingdom from this device only: the server copy (validated on sync) can be
 * downloaded again.
 */
export class DiscardLocalSave {
  constructor(private readonly kingdoms: KingdomRepository) {}

  execute(id: string): void {
    this.kingdoms.delete(id);
  }
}
