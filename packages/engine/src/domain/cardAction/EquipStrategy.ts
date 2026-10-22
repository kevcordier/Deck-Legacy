import type { GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

/** Places the source (an equipment) under the chosen card in play. */
export class EquipStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const holder = payload.instanceIds?.[0];
    if (holder === undefined) return gameState;
    return {
      ...gameState,
      equipped: { ...gameState.equipped, [payload.sourceInstanceId]: holder },
    };
  }
}
