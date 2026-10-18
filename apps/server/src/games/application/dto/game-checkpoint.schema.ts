import type { GameCheckpoint } from '@deck-legacy/engine/domain/types';
import { z } from 'zod';

/** State kept by the server at the start of the last round (EDR-052, 053), as a JSON object. */
export const gameCheckpointSchema = z
  .object({ seq: z.number().int(), state: z.record(z.string(), z.unknown()) })
  .transform(checkpoint => checkpoint as unknown as GameCheckpoint);
