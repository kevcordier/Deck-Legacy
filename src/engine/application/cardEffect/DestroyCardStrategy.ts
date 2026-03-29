import type { CardEffectStrategy } from '@engine/application/cardEffect/CardEffectStrategy';
import { destroyCards } from '@engine/application/gameStateHelper';
import type { GameState } from '@engine/domain/types';

export class DestroyCardStrategy implements CardEffectStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      cardId: string;
    },
  ): GameState {
    return destroyCards(gameState, [payload.cardId]);
  }
}
