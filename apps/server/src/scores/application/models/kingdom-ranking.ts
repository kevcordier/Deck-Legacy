import type { CampaignSegmentScore } from '../../../games/domain/campaign-segment-score';

/** A kingdom of a registered player on the kingdom leaderboard. */
export type KingdomRanking = {
  id: string;
  name: string;
  displayName: string | null;
  score: number;
  segments: CampaignSegmentScore[];
};
