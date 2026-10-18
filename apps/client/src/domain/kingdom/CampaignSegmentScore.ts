/** Score at the end of a campaign segment (`base` or an expansion name). */
export type CampaignSegmentScore = {
  segment: string;
  /** Cumulative score of the whole campaign when the segment ended. */
  score: number;
};
