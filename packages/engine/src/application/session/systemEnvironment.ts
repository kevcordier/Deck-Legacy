import type { EngineEnvironment } from '../../domain/environment/EngineEnvironment';

/** The real clock, ids and randomness (the engine's behaviour before EDR-058). */
export const systemEnvironment: EngineEnvironment = {
  now: () => Date.now(),
  newId: () => crypto.randomUUID(),
  // Only shuffles games started before seeds (EDR-051): not used for anything security related.
  random: Math.random,
};
