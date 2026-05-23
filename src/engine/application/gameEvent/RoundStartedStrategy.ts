import type { GameEventStrategy } from './GameEventStrategy';
import { pickPermanentBoardEffects } from '@engine/application/gameStateHelper';
import type { GameEvent, GameState, RoundStartedEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class RoundStartedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as RoundStartedEvent;
    const addedCards = e.lastAddedCards ?? [];

    return {
      ...gameState,
      round: e.round,
      turn: 0,
      drawPile: e.newDrawPile,
      discoveryPile: gameState.discoveryPile.filter(id => !addedCards.includes(id)),
      lastAddedCards: addedCards,
      boardEffects: pickPermanentBoardEffects(gameState.boardEffects, gameState.permanents),
      discardPile: [],
      board: [],
      phase: Phase.ROUND_START,
    };
  }
}
