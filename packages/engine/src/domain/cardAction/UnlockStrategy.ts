import type { GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

/** A foundation brings its stickers (added to the stock) and its resources (EDR-059). */
export class UnlockStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const { stickers = {}, resources = [] } = payload.unlock ?? {};
    const stickerStock = { ...gameState.stickerStock };
    for (const [stickerId, count] of Object.entries(stickers)) {
      stickerStock[Number(stickerId)] = (stickerStock[Number(stickerId)] ?? 0) + count;
    }
    const unlockedResources = [...new Set([...(gameState.unlockedResources ?? []), ...resources])];
    return {
      ...gameState,
      stickerStock,
      ...(unlockedResources.length > 0 && { unlockedResources }),
    };
  }
}
