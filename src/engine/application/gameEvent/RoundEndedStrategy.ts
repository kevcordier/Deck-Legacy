import type { GameEventStrategy } from './GameEventStrategy';
import type { GameState } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class RoundEndedStrategy implements GameEventStrategy {
  apply(gameState: GameState): GameState {
    return {
      ...gameState,
      discardPile: [...new Set([...gameState.board, ...gameState.discardPile])],
      board: [],
      phase: Phase.ROUND_END,
    };
  }
}
