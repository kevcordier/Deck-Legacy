import { ResourceType } from '../enums';
import type { GameState } from '../types';

/** Resources unlocked by a foundation: never offered before (EDR-059). */
const LOCKED_RESOURCES: ResourceType[] = [ResourceType.SCIENCE, ResourceType.HERB];

/** Resources an "any resource" gain offers: the six base ones and those unlocked in the kingdom. */
export function getOfferedResources(gameState: GameState): ResourceType[] {
  const unlocked = gameState.unlockedResources ?? [];
  return Object.values(ResourceType).filter(
    type => !LOCKED_RESOURCES.includes(type) || unlocked.includes(type),
  );
}
