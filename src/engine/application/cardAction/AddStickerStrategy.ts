import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, ResolvedActionEffect } from '@engine/domain/types';

export class AddStickerStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const targetId = payload.instanceIds?.[0];
    if (targetId === undefined || payload.stickerIds === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    const targetStateId = payload.stateId ?? gs.instances[targetId].stateId;
    payload.stickerIds.forEach(stickerId => {
      gs.stickerStock[stickerId]--;
      if (!gs.instances[targetId].stickers[targetStateId]) {
        gs.instances[targetId].stickers[targetStateId] = [];
      }
      gs.instances[targetId].stickers[targetStateId].push(stickerId);
    });

    return {
      ...gs,
      stickerStock: gs.stickerStock,
      instances: gs.instances,
    };
  }
}
