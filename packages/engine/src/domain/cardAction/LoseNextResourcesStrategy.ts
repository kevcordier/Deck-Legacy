import type { GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

export class LoseNextResourcesStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    return {
      ...gameState,
      resourcesToLose: (gameState.resourcesToLose ?? 0) + (payload.value ?? 0),
    };
  }
}
