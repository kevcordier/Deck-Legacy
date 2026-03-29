import type { CardEffectStrategy } from '@engine/application/cardEffect/CardEffectStrategy';
import type { GameState } from '@engine/domain/types';

export class PlaceCardInDrawPileStrategy implements CardEffectStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      cardId: string;
      position: number;
    },
  ): GameState {
    gameState.discoveryPile = gameState.discoveryPile.filter(c => c !== payload.cardId);
    gameState.board = gameState.board.filter(c => c !== payload.cardId);
    gameState.drawPile = gameState.drawPile.filter(c => c !== payload.cardId);
    delete gameState.blockingCards[payload.cardId];
    gameState.drawPile.splice(payload.position, 0, payload.cardId);
    return gameState;
  }
}
