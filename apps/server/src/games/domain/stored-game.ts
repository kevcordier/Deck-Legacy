import type { GameCheckpoint, GameEvent } from '@deck-legacy/engine/domain/types';

/** A stored, non-abandoned game with its full event log (for export). */
export type StoredGame = {
  id: string;
  userId: string;
  name: string;
  version: number;
  cardNames: Record<string, string>;
  events: GameEvent[];
  checkpoint: GameCheckpoint | null;
  updatedAt: Date;
};
