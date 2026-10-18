import type { KingdomRepository } from '@application/ports/KingdomRepository';
import type { KingdomMeta } from '@domain/kingdom/KingdomMeta';
import type { SaveData } from '@domain/kingdom/SaveData';

/** A game to open instead of a new one (development scenarios). */
export type StartingSave = Pick<SaveData, 'events' | 'checkpoint'>;

/** Creates a kingdom on this device; its save is written once the game starts. */
export class CreateKingdom {
  constructor(
    private readonly kingdoms: KingdomRepository,
    private readonly newId: () => string,
  ) {}

  execute(name: string, startingSave?: StartingSave): KingdomMeta {
    const kingdom = this.kingdoms.create(this.newId(), name);
    if (startingSave) {
      // The saved game opens instead of a new one; its events carry no game id.
      this.kingdoms.writeSave({
        id: kingdom.id,
        events: startingSave.events,
        cardNames: {},
        savedAt: Date.now(),
        sync: { dirty: true },
        ...(startingSave.checkpoint ? { checkpoint: startingSave.checkpoint } : {}),
      });
    }
    return kingdom;
  }
}
