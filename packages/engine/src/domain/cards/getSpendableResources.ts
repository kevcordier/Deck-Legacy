import { PassiveType } from '../enums';
import type { GameState, Resources } from '../types';
import { passivesInPlay } from './passivesInPlay';

/** Resources that can pay a cost: RESTRICT_SPEND keeps its resources for upgrade costs only. */
export function getSpendableResources(gameState: GameState, forUpgrade = false): Resources {
  if (forUpgrade) return gameState.resources;
  const reserved = new Set(
    passivesInPlay(gameState, PassiveType.RESTRICT_SPEND).flatMap(p =>
      Object.keys(p.resources ?? {}),
    ),
  );
  return Object.fromEntries(
    Object.entries(gameState.resources).filter(([key]) => !reserved.has(key)),
  );
}
