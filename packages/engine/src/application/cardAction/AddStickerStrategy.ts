import type { GameState, ResolvedActionEffect } from '../../domain/types';
import type { CardActionStrategy } from './CardActionStrategy';

export class AddStickerStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const { instanceIds, stickerIds } = payload;
    if (!instanceIds?.length || stickerIds === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    instanceIds.forEach(targetId => {
      const targetStateId = payload.stateId ?? gs.instances[targetId].stateId;
      stickerIds.forEach(stickerId => {
        gs.stickerStock[stickerId]--;
        if (!gs.instances[targetId].stickers[targetStateId]) {
          gs.instances[targetId].stickers[targetStateId] = [];
        }
        gs.instances[targetId].stickers[targetStateId].push(stickerId);
      });
    });

    return {
      ...gs,
      stickerStock: gs.stickerStock,
      instances: gs.instances,
    };
  }
}
