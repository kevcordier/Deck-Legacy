import type { CardDef, GameState, Sticker } from '@engine/domain/types';
import { getActiveState } from '@engine/application/cardHelpers';

export const discardCards = (_gameState: GameState, cardIds: number[]): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  cardIds.forEach(cardId => {
    gameState.discoveryPile = gameState.discoveryPile.filter(c => c !== cardId);
    gameState.board = gameState.board.filter(c => c !== cardId);
    gameState.drawPile = gameState.drawPile.filter(c => c !== cardId);
    gameState.discardPile.push(cardId);
    delete gameState.blockingCards[cardId];
  });
  return gameState;
};

export const drawCards = (_gameState: GameState, turnCards: number[]): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  gameState.drawPile = gameState.drawPile.filter(id => !turnCards.includes(id));
  gameState.board = [...gameState.board, ...turnCards];

  return gameState;
};

export const destroyCards = (_gameState: GameState, cardIds: number[]): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  cardIds.forEach(cardId => {
    gameState.discoveryPile = gameState.discoveryPile.filter(c => c !== cardId);
    gameState.board = gameState.board.filter(c => c !== cardId);
    gameState.drawPile = gameState.drawPile.filter(c => c !== cardId);
    gameState.discardPile = gameState.discardPile.filter(c => c !== cardId);
    gameState.destroyedPile.push(cardId);
    delete gameState.blockingCards[cardId];
  });
  return gameState;
};

export const endTurn = (_gameState: GameState): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  gameState.resources = {};
  return discardCards(gameState, gameState.board);
};

export function computeScore(
  state: GameState,
  defs: Record<number, CardDef>,
  stickers: Record<string, Sticker>,
): number {
  const allIds = [...state.drawPile, ...state.discardPile, ...state.board, ...state.permanents];
  return allIds.reduce((total, id) => {
    const instance = state.instances[id];
    if (!instance) return total;
    const cs = getActiveState(instance, defs);
    const stickerGlory =
      instance.stickers[instance.stateId]?.reduce((sum, s) => sum + (stickers[s]?.glory ?? 0), 0) ??
      0;
    return total + (cs.glory ?? 0) + stickerGlory;
  }, 0);
}
