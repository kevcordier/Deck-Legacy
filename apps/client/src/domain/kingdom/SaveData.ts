import type { SyncInfo } from './SyncInfo';
import type { GameCheckpoint, GameEvent } from '@deck-legacy/engine/domain/types';

/** A kingdom's save: the event log the engine replays, card names and sync state. */
export type SaveData = {
  id: string;
  events: GameEvent[];
  cardNames: Record<string, string>;
  savedAt: number;
  sync: SyncInfo;
  /** State the server kept at the start of the last round: the game resumes from it. */
  checkpoint?: GameCheckpoint;
};
