import { nullableStringSchema } from '../../../shared/presentation/http/nullable-string.schema';
import type { ScoreEntry } from '../../application/models/score-entry';
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
  }) satisfies z.ZodType<ScoreEntry>,
) {}
