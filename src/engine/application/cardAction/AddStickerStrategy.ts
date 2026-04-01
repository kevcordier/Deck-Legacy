import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState } from '@engine/domain/types';

export class AddStickerStrategy implements CardActionStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: string;
      sourceInstanceId: number;
      stickerId: number;
      cardId: number;
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
