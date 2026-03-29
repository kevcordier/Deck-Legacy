import type { CardEffectStrategy } from '@engine/application/cardEffect/CardEffectStrategy';
import type { GameState } from '@engine/domain/types';

export class AddStickerStrategy implements CardEffectStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      stickerId: number;
      cardId: string;
    },
  ): GameState {
    gameState.stickerStock[payload.stickerId]--;
    if (
      !gameState.instances[payload.cardId].stickers[gameState.instances[payload.cardId].stateId]
    ) {
      gameState.instances[payload.cardId].stickers[gameState.instances[payload.cardId].stateId] =
        [];
    }
    gameState.instances[payload.cardId].stickers[gameState.instances[payload.cardId].stateId].push(
      payload.stickerId,
    );

    return gameState;
  }
}
