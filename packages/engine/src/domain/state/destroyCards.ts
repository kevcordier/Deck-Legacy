import type { GameState } from '../types';
import { releaseFromPermanents } from './releaseFromPermanents';
import { removeFromDiscovery } from './removeFromDiscovery';
import { withEquipment } from './withEquipment';

export const destroyCards = (_gameState: GameState, destroyedIds: number[]): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  // A holder destroyed destroys its equipment
  const cardIds = withEquipment(gameState, destroyedIds);
  cardIds.forEach(cardId => {
    removeFromDiscovery(gameState, [cardId]);
    gameState.board = gameState.board.filter(c => c !== cardId);
    gameState.drawPile = gameState.drawPile.filter(c => c !== cardId);
    gameState.permanents = gameState.permanents.filter(c => c !== cardId);
    gameState.discardPile = gameState.discardPile.filter(c => c !== cardId);
    gameState.destroyedPile = [...new Set([...gameState.destroyedPile, cardId])];
    const { [cardId]: _destroyed, ...restDestroyEffects } = gameState.boardEffects;
    gameState.boardEffects = restDestroyEffects;
  });
  releaseFromPermanents(gameState, cardIds);
  return gameState;
};
