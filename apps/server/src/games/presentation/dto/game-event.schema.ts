import type { GameEvent } from '@deck-legacy/engine/domain/types';
import { z } from 'zod';

/**
 * A game event as sent over HTTP: any JSON object. The engine replay is what validates it;
 * the schema only documents it (as `object` in OpenAPI) and types it as `GameEvent`.
 */
export const gameEventSchema = z
  .record(z.string(), z.unknown())
  .transform(event => event as unknown as GameEvent);
