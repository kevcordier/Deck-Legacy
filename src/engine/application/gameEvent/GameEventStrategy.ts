import type { GameEvent, GameState } from '@engine/domain/types';

export interface GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState;
}
