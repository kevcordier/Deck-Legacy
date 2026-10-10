import { Phase } from '../../domain/enums';
import type { GameEvent, GameState, ParchmentCardDiscoveredEvent } from '../../domain/types';
import type { GameEventStrategy } from './GameEventStrategy';

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
