import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, ResolvedActionEffect } from '@engine/domain/types';

export class PlaceCardInDrawPileStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceId = payload.instanceIds?.[0];
    if (instanceId === undefined || payload.position === undefined) return gameState;
    gameState.discoveryPile = gameState.discoveryPile.filter(c => c !== instanceId);
    gameState.board = gameState.board.filter(c => c !== instanceId);
    gameState.drawPile = gameState.drawPile.filter(c => c !== instanceId);
    const { [instanceId]: _placed, ...restEffects } = gameState.boardEffects;
    gameState.boardEffects = restEffects;
    let index = payload.position;

    if (index === 'top') index = 0;
    else if (index === 'bottom') index = gameState.drawPile.length;

    gameState.drawPile.splice(index, 0, instanceId);
    return gameState;
  }
}
