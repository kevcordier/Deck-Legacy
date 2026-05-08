import type { GameEventStrategy } from './GameEventStrategy';
import type { GameEvent, GameState, ParchmentCardDiscoveredEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class ParchmentCardDiscoveredStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as ParchmentCardDiscoveredEvent;
    return {
      ...gameState,
      lastAddedCards: [],
      onGoingParchment: e.cardInstanceId,
      discoveryPile: gameState.discoveryPile.filter(id => id !== e.cardInstanceId),
      phase: Phase.PARCHMENT,
    };
  }
}
