import type { GameEventStrategy } from './GameEventStrategy';
import { pickGlobalBoardEffects } from '@engine/application/gameStateHelper';
import type { GameEvent, GameState, RoundStartedEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class RoundStartedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as RoundStartedEvent;

    return {
      ...gameState,
      round: e.round,
      turn: 0,
      drawPile: e.newDrawPile,
      boardEffects: pickGlobalBoardEffects(gameState.boardEffects),
      discardPile: [],
      board: [],
      lastAddedCards: [],
      phase: Phase.PRETURN,
    };
  }
}
