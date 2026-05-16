import type { GameEventStrategy } from './GameEventStrategy';
import type { GameEvent, GameState, RoundEndedEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class RoundEndedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as RoundEndedEvent;
    if (Object.keys(e.endRoundTriggers).length > 0) {
      gameState.triggerPile = { ...gameState.triggerPile, ...e.endRoundTriggers };

      return gameState;
    }

    // If there are still triggers pending, stay in current phase
    if (Object.keys(gameState.triggerPile).length > 0) {
      return gameState;
    }

    return {
      ...gameState,
      discardPile: [...new Set([...gameState.board, ...gameState.discardPile])],
      board: [],
      phase: Phase.ROUND_END,
    };
  }
}
