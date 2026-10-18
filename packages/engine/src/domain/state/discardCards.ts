import { getInstancesTriggerEffects } from '../cards/getInstancesTriggerEffects';
import { Trigger } from '../enums';
import type { CardDef, GameState, Sticker } from '../types';
import { removeFromDiscovery } from './removeFromDiscovery';

export const discardCards = (
  _gameState: GameState,
  cardIds: number[],
  cardDefs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): GameState => {
  const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
  gameState.lastDiscardedCards = cardIds;
  getInstancesTriggerEffects(
    cardIds.map(id => gameState.instances[id]).filter(Boolean),
    cardDefs,
    stickerDefs,
    Trigger.ON_DISCARD,
    gameState,
  ).forEach(({ effectDef, sourceInstanceId }) => {
    gameState.triggerPile[crypto.randomUUID()] = { effectDef, sourceInstanceId };
  });
  cardIds.forEach(cardId => {
    if (gameState.destroyedPile.includes(cardId)) {
      return;
    }
    removeFromDiscovery(gameState, [cardId]);
    gameState.board = gameState.board.filter(c => c !== cardId);
    gameState.drawPile = gameState.drawPile.filter(c => c !== cardId);
    gameState.discardPile = [...new Set([...gameState.discardPile, cardId])];
    const { [cardId]: _discarded, ...restDiscardEffects } = gameState.boardEffects;
    gameState.boardEffects = restDiscardEffects;
  });
  return gameState;
};
