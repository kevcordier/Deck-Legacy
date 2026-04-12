import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { ActionType } from '@engine/domain/enums';
import type { GameState } from '@engine/domain/types';

export class PlaceCardInDrawPileStrategy implements CardActionStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: ActionType;
      sourceInstanceId: number;
      instanceId: number;
      position: number;
    },
  ): GameState {
    gameState.discoveryPile = gameState.discoveryPile.filter(c => c !== payload.instanceId);
    gameState.board = gameState.board.filter(c => c !== payload.instanceId);
    gameState.drawPile = gameState.drawPile.filter(c => c !== payload.instanceId);
    delete gameState.blockingCards[payload.instanceId];
    gameState.drawPile.splice(payload.position, 0, payload.instanceId);
    return gameState;
  }
}
