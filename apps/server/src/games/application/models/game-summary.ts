import type { CampaignSegmentScore } from '../../domain/campaign-segment-score';

/** Server-side state of a synced game (a kingdom). */
export type GameSummary = {
  id: string;
  name: string;
  /** Incremented on every accepted sync. */
  version: number;
  eventCount: number;
  /** Score computed by the server when replaying the events. */
  score: number;
  /** Segment scores in the order they were played. */
  segments: CampaignSegmentScore[];
  finished: boolean;
  /** ISO date of the last accepted sync. */
  updatedAt: string;
};
