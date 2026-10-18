import { z } from 'zod';

/** Score at the end of a campaign segment (`base` or an expansion name). */
export const campaignSegmentScoreSchema = z.object({
  segment: z.string(),
  /** Cumulative score of the whole campaign when the segment ended. */
  score: z.number(),
});

export type CampaignSegmentScore = z.output<typeof campaignSegmentScoreSchema>;
