import type { CampaignSegmentScore } from './campaign-segment-score';
import type { GameCheckpoint, GameEvent } from '@deck-legacy/engine/domain/types';

/** A checked game, as the server stores it after a sync. */
export type GameSnapshot = {
  name: string;
  cardNames: Record<string, string>;
  score: number;
  segments: CampaignSegmentScore[];
  finished: boolean;
  /**
   * The log was produced by the player's commands (EDR-051). `undefined`: a log without a seed,
   * which cannot be verified: a new game is stored unverified, a stored one keeps its flag.
   */
  verified?: boolean;
  events: GameEvent[];
  /** State kept at the start of the last round (EDR-052); `null` when there is none yet. */
  checkpoint: GameCheckpoint | null;
};
