import type { ResourceType } from '../enums';
import type { GameState, Resources } from '../types';

export const spendResources = (_gameState: GameState, resources: Resources): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  for (const [resourceKey, number] of Object.entries(resources)) {
    const key = resourceKey as ResourceType;
    const newValue = (gameState.resources[key] ?? 0) - number;
    if (newValue <= 0) {
      const { [key]: _spent, ...restResources } = gameState.resources;
      gameState.resources = restResources;
    } else {
      gameState.resources[key] = newValue;
    }
  }
  return gameState;
};
