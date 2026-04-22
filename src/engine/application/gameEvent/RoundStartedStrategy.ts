import type { GameEventStrategy } from './GameEventStrategy';
import type { GameEvent, GameState, RoundStartedEvent, TriggerEntry } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class RoundStartedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as RoundStartedEvent;
    const triggerPile = e.onDiscoverEvents.reduce(
      (acc, { effectDef, sourceInstanceId }) => {
        acc[crypto.randomUUID()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );
    return {
      ...gameState,
      round: e.round,
      discoveryPile: gameState.discoveryPile.filter(id => !e.newCards.includes(id)),
      turn: 0,
      lastAddedIds: e.newCards,
      drawPile: e.newDrawPile,
      triggerPile,
      boardEffects: {},
      discardPile: [],
      board: [],
      phase: Phase.START_ROUND,
    };
  }
}
