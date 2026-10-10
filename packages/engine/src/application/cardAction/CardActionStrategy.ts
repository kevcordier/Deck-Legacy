import type { GameState, ResolvedActionEffect } from '../../domain/types';

export interface CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState;
}
