import type { CardEffectStrategy } from '@engine/application/cardEffect/CardEffectStrategy';
import { discardCards } from '@engine/application/gameStateHelper';
import type { GameState } from '@engine/domain/types';

export class DiscardCardStrategy implements CardEffectStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      cardId: string;
    },
  ): GameState {
    return discardCards(gameState, [payload.cardId]);
  }
}
