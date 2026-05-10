import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, ResolvedActionEffect } from '@engine/domain/types';

export class PlaceCardInPileStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceIds = payload.instanceIds;
    if (instanceIds === undefined || payload.position === undefined) return gameState;
    instanceIds.forEach(instanceId => {
      const { [instanceId]: _placed, ...restEffects } = gameState.boardEffects;
      gameState.boardEffects = restEffects;
      let index = payload.position === 'top' ? 0 : payload.position;
      gameState.board = gameState.board.filter(c => c !== instanceId);
      gameState.drawPile = gameState.drawPile.filter(c => c !== instanceId);
      gameState.discoveryPile = gameState.discoveryPile.filter(c => c !== instanceId);
      gameState.discardPile = gameState.discardPile.filter(c => c !== instanceId);

      if (payload.deck === 'discovery') {
        if (index === 'bottom') index = gameState.discoveryPile.length;
        gameState.discoveryPile.splice(index as number, 0, instanceId);
        return gameState;
      }
      if (payload.deck === 'discard') {
        if (index === 'bottom') index = gameState.discardPile.length;
        gameState.discardPile.splice(index as number, 0, instanceId);
        return gameState;
      }
      if (index === 'bottom') index = gameState.drawPile.length;
      gameState.drawPile.splice(index as number, 0, instanceId);
    });
    return gameState;
  }
}
