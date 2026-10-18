import type { GameCheckpoint } from '@deck-legacy/engine/domain/types';

/** Owner, version and checkpoint of a stored game, whatever its status. */
export type GameMeta = {
  userId: string;
  version: number;
  checkpoint: GameCheckpoint | null;
};
