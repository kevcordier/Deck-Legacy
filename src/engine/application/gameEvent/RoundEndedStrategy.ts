import type { GameEventStrategy } from './GameEventStrategy';
import type { GameEvent, GameState, RoundEndedEvent, TriggerEntry } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class RoundEndedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as RoundEndedEvent;
    const triggerPile = e.onDiscoverEvents.reduce(
      (acc, { effectDef, sourceInstanceId }) => {
        acc[crypto.randomUUID()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );
    return {
      ...gameState,
      discoveryPile: gameState.discoveryPile.filter(id => !e.newCards.includes(id)),
      lastAddedIds: e.newCards,
      triggerPile,
      boardEffects: {},
      discardPile: [...gameState.board, ...gameState.discardPile],
      board: [],
      phase: Phase.PREROUND,
    };
  }
}
