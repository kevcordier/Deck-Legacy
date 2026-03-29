import type { CardEffectStrategy } from '@engine/application/cardEffect/CardEffectStrategy';
import type { GameState } from '@engine/domain/types';

export class PlayCardStrategy implements CardEffectStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      cardId: string;
    },
  ): GameState {
    gameState.discoveryPile = gameState.discoveryPile.filter(c => c !== payload.cardId);
    gameState.drawPile = gameState.drawPile.filter(c => c !== payload.cardId);
    gameState.destroyedPile = gameState.destroyedPile.filter(c => c !== payload.cardId);
    gameState.discardPile = gameState.discardPile.filter(c => c !== payload.cardId);
    gameState.board = [...gameState.board, payload.cardId];
    return gameState;
  }
}
