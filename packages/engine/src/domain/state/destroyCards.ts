import type { GameState } from '../types';
import { removeFromDiscovery } from './removeFromDiscovery';

export const destroyCards = (_gameState: GameState, cardIds: number[]): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
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
  return gameState;
};
