import type { GameState, ResolvedAction } from '@engine/domain/types';

export interface CardActionStrategy {
  applyEffect(gameState: GameState, payload: ResolvedAction): GameState;
}
