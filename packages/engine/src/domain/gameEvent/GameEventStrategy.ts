import type { GameEvent, GameState } from '../types';

export interface GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState;
}
