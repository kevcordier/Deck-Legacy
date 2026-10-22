import { getActivePassives } from '../cards/selection/getActivePassives';
import type { CardDef, GameState } from '../types';

export const syncInstancePassivesInBoardEffects = (
  _gameState: GameState,
  instanceId: number,
  cardDefs: Record<number, CardDef>,
): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  const instance = gameState.instances[instanceId];
  if (!instance) {
    return gameState;
  }

  const passives = getActivePassives(gameState, instanceId, cardDefs);
  if (passives.length === 0) {
    const { [instanceId]: _synced, ...restBoardEffects } = gameState.boardEffects;
    gameState.boardEffects = restBoardEffects;
    return gameState;
  }

  gameState.boardEffects[instanceId] = passives;
  return gameState;
};
