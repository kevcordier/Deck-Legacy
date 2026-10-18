import { gameCheckpointSchema } from './game-checkpoint.schema';
import { gameEventSchema } from './game-event.schema';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/** Full event log of a kingdom (`GET /games/:id/export`). */
export class GameExportDto extends createZodDto(
  z.object({
    id: z.string(),
    name: z.string(),
    /** Server version of this log (as in `GameSummary.version`). */
    version: z.number().int(),
    events: z.array(gameEventSchema),
    cardNames: z.record(z.string(), z.string()),
    savedAt: z.number(),
    /**
     * State kept by the server at the start of the last round (EDR-052, 053): the client resumes
     * the game from it. Missing from servers older than EDR-053.
     */
    checkpoint: gameCheckpointSchema.nullable().optional(),
  }),
) {}

export type GameExport = z.output<typeof GameExportDto.schema>;
