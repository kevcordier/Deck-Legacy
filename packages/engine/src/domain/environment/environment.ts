import type { EngineEnvironment } from './EngineEnvironment';

let current: EngineEnvironment | undefined;

function active(): EngineEnvironment {
  if (!current)
    throw new Error('No engine environment: create a GameSession or call environment.use()');
  return current;
}

/**
 * The environment the game rules run with. The engine runs synchronously, so `GameSession`
 * installs its environment (`use`) when it is entered and every rule reads it from here.
 */
export const environment = {
  use(next: EngineEnvironment): void {
    current = next;
  },
  now: (): number => active().now(),
  newId: (): string => active().newId(),
  random: (): number => active().random(),
};
