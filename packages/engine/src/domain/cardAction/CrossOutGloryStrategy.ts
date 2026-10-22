import type { GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

/** Crosses out the glory of the chosen cards' current state: it is worth 0 (Lady Elara). */
export class CrossOutGloryStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const ids = payload.instanceIds ?? [];
    if (ids.length === 0) return gameState;
    const instances = { ...gameState.instances };
    for (const id of ids) {
      const instance = instances[id];
      if (!instance) continue;
      instances[id] = {
        ...instance,
        crossedOutGloryStates: [...(instance.crossedOutGloryStates ?? []), instance.stateId],
      };
    }
    return { ...gameState, instances };
  }
}
