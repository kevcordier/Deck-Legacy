import { ScoreEntryDto } from './score-entry.dto';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class LeaderboardDto extends createZodDto(
  z.object({
    segment: z.string(),
    entries: z.array(ScoreEntryDto.schema),
  }),
) {}

export type Leaderboard = z.output<typeof LeaderboardDto.schema>;
