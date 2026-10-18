import { campaignSegmentScoreSchema } from './campaign-segment-score.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/** Server-side state of a synced game (a kingdom). */
export class GameSummaryDto extends createZodDto(
  z.object({
    id: z.string(),
    name: z.string(),
    /** Incremented on every accepted sync. */
    version: z.number().int(),
    eventCount: z.number().int(),
    /** Score computed by the server when replaying the events. */
    score: z.number(),
    /** Segment scores in the order they were played. */
    segments: z.array(campaignSegmentScoreSchema),
    finished: z.boolean(),
    /** ISO date of the last accepted sync. */
    updatedAt: z.string(),
  }),
) {}

export type GameSummary = z.output<typeof GameSummaryDto.schema>;
