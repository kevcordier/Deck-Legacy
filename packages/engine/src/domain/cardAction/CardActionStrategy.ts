import type { GameState, ResolvedActionEffect } from '../types';

export interface CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState;
}
