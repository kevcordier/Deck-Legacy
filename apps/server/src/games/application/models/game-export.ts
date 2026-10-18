import type { GameCheckpoint, GameEvent } from '@deck-legacy/engine/domain/types';

/** Full event log of a kingdom, to resume it on another device. */
export type GameExport = {
  id: string;
  name: string;
  /** Server version of this log (as in `GameSummary.version`). */
  version: number;
  events: GameEvent[];
  cardNames: Record<string, string>;
  savedAt: number;
  /** State kept at the start of the last round (EDR-052, 053); missing before EDR-053. */
  checkpoint?: GameCheckpoint | null;
};
