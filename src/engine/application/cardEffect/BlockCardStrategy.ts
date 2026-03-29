import type { CardEffectStrategy } from '@engine/application/cardEffect/CardEffectStrategy';
import type { GameState } from '@engine/domain/types';

export class BlockCardStrategy implements CardEffectStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      blockingCardId: string;
      blockedCardId: string;
    },
  ): GameState {
    gameState.blockingCards[payload.blockingCardId] = payload.blockedCardId;
    return gameState;
  }
}
