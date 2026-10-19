import { ResourceType } from '../enums';
import type { GameState, Resources } from '../types';

/** Removes from a gain the units Too Much Mead makes the player lose, and counts them down. */
export function loseGainedResources(
  gameState: GameState,
  gained: Resources,
): { gained: Resources; gameState: GameState } {
  let toLose = gameState.resourcesToLose ?? 0;
  if (toLose <= 0) return { gained, gameState };
  const kept: Resources = { ...gained };
  // shortcut: within one gain the units go in resource order; the player cannot pick them yet.
  for (const type of Object.values(ResourceType)) {
    const lost = Math.min(kept[type] ?? 0, toLose);
    if (lost === 0) continue;
    kept[type] = (kept[type] ?? 0) - lost;
    toLose -= lost;
  }
  return { gained: kept, gameState: { ...gameState, resourcesToLose: toLose } };
}
