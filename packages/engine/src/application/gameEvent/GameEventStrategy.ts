import type { GameEvent, GameState } from '../../domain/types';

export interface GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState;
}
