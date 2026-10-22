import type { GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

/** Crosses out the chosen activated effect: the card no longer has it (Enemy Archer). */
export class CrossOutActionStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const { crossedOutAction } = payload;
    if (!crossedOutAction) return gameState;
    const instance = gameState.instances[crossedOutAction.instanceId];
    if (!instance) return gameState;
    return {
      ...gameState,
      instances: {
        ...gameState.instances,
        [instance.id]: {
          ...instance,
          crossedOutActionIds: [...(instance.crossedOutActionIds ?? []), crossedOutAction.actionId],
        },
      },
    };
  }
}
