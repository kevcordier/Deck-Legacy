import type { GameState, ResolvedActionEffect } from '@engine/domain/types';

export interface CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState;
}
