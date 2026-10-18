import type { SyncGameCommand } from '../../application/models/sync-game-command';
import { gameEventSchema } from './game-event.schema';
import { KINGDOM_NAME_MAX_LENGTH } from '@deck-legacy/engine/domain/kingdom/kingdomConstants';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * `PUT /games/:id` — the events of a game from `fromSeq` on (the server keeps the ones before).
 * With `baseVersion`, the server refuses (`409 STALE_VERSION`) a sync built on another version;
 * without it, the sync overwrites the stored game (clients older than the delta sync).
 */
export class SyncGameRequestDto extends createZodDto(
  z.object({
    events: z.array(gameEventSchema).max(20_000),
    /** Index, in the full log, of the first event sent. */
    fromSeq: z.number().int().min(0).default(0),
    /** Server version the client built on. */
    baseVersion: z.number().int().min(1).optional(),
    cardNames: z.record(z.string(), z.string().max(60)).default({}),
    /** Kingdom name chosen by the player; metadata outside the event log. */
    name: z.string().trim().max(KINGDOM_NAME_MAX_LENGTH).default(''),
  }) satisfies z.ZodType<SyncGameCommand>,
) {}
