import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, ResolvedActionEffect } from '@engine/domain/types';

export class AddStickerStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const targetId = payload.instanceIds?.[0];
    if (targetId === undefined || payload.stickerId === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    gs.stickerStock[payload.stickerId]--;
    if (!gs.instances[targetId].stickers[gs.instances[targetId].stateId]) {
      gs.instances[targetId].stickers[gs.instances[targetId].stateId] = [];
    }
    gs.instances[targetId].stickers[gs.instances[targetId].stateId].push(payload.stickerId);

    return {
      ...gs,
      stickerStock: gs.stickerStock,
      instances: gs.instances,
    };
  }
}
