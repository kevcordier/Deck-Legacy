import type { CampaignSegmentScore } from '../../domain/campaign-segment-score';
import { z } from 'zod';

export const campaignSegmentScoreSchema = z.object({
  segment: z.string(),
  /** Cumulative score of the whole campaign when the segment ended. */
  score: z.number(),
}) satisfies z.ZodType<CampaignSegmentScore>;
