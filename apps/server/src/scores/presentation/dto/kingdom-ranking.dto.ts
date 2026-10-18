import { campaignSegmentScoreSchema } from '../../../games/presentation/dto/campaign-segment-score.schema';
import { nullableStringSchema } from '../../../shared/presentation/http/nullable-string.schema';
import type { KingdomRanking } from '../../application/models/kingdom-ranking';
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
  }) satisfies z.ZodType<KingdomRanking>,
) {}
