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
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState; // Deep clone to avoid mutating original state
    gs.stickerStock[payload.stickerId]--;
    if (!gs.instances[payload.cardId].stickers[gs.instances[payload.cardId].stateId]) {
      gs.instances[payload.cardId].stickers[gs.instances[payload.cardId].stateId] = [];
    }
    gs.instances[payload.cardId].stickers[gs.instances[payload.cardId].stateId].push(
      payload.stickerId,
    );

    return {
      ...gs,
      stickerStock: gs.stickerStock,
      instances: gs.instances,
    };
  }
}
