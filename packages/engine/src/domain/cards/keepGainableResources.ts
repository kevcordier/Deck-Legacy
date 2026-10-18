import { PassiveType } from '../enums';
import type { GameState, Resources } from '../types';
import { passivesInPlay } from './passivesInPlay';

/** Drops the resources that a RESTRICT_GAIN passive in play does not allow. */
export function keepGainableResources(resources: Resources, gameState: GameState): Resources {
  const restrictions = passivesInPlay(gameState, PassiveType.RESTRICT_GAIN);
  return Object.fromEntries(
    Object.entries(resources).filter(([key]) =>
      restrictions.every(p => p.resources?.[key as keyof Resources]),
    ),
  );
}
