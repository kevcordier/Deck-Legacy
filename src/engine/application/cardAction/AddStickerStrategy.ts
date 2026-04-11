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
      instanceId: number;
    },
  ): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState; // Deep clone to avoid mutating original state
    const targetId = payload.instanceId;
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
