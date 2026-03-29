import type { GameState } from '@engine/domain/types';

export interface CardEffectStrategy {
  applyEffect(gameState: GameState, payload: unknown): GameState;
}
