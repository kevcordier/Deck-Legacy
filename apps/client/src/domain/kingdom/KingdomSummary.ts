import type { CampaignSegmentScore } from './CampaignSegmentScore';

/** Scores shown on the home page; computed on the device, the server's scores stay authoritative. */
export type KingdomSummary = {
  score: number;
  /** Cumulative score at the end of each campaign segment, in the order they were played. */
  segments: CampaignSegmentScore[];
  finished: boolean;
  /** Missing for summaries saved before they were recorded, or freshly downloaded from the server. */
  round?: number;
  turn?: number;
};
