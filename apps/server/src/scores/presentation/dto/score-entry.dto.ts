import { nullableStringSchema } from '../../../common/nullable-string.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class ScoreEntryDto extends createZodDto(
  z.object({
    id: z.string(),
    gameId: z.string(),
    segment: z.string(),
    score: z.number(),
    createdAt: z.string(),
    displayName: nullableStringSchema,
  }),
) {}

export type ScoreEntry = z.output<typeof ScoreEntryDto.schema>;
