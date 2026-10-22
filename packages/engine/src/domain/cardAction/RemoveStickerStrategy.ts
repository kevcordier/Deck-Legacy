import type { GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

/** Takes the given stickers off the current state of the chosen cards (curing an infection). */
export class RemoveStickerStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const { instanceIds, stickerIds = [] } = payload;
    if (!instanceIds?.length || stickerIds.length === 0) return gameState;
    const instances = { ...gameState.instances };
    for (const id of instanceIds) {
      const instance = instances[id];
      const current = instance.stickers[instance.stateId] ?? [];
      instances[id] = {
        ...instance,
        stickers: {
          ...instance.stickers,
          [instance.stateId]: current.filter(stickerId => !stickerIds.includes(stickerId)),
        },
      };
    }
    return { ...gameState, instances };
  }
}
