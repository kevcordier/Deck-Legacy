import { campaignSegmentScoreSchema } from '../../../games/application/dto/campaign-segment-score.schema';
import { nullableStringSchema } from '../../../shared/http/nullable-string.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/** A kingdom of a registered player on the kingdom leaderboard (`GET /scores/kingdoms`). */
export class KingdomRankingDto extends createZodDto(
  z.object({
    id: z.string(),
    name: z.string(),
    displayName: nullableStringSchema,
    score: z.number(),
    segments: z.array(campaignSegmentScoreSchema),
  }),
) {}

export type KingdomRanking = z.output<typeof KingdomRankingDto.schema>;
