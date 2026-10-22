import { Phase } from '../enums';
import type { GameEvent, GameState, ParchmentCardDiscoveredEvent } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';

export class ParchmentCardDiscoveredStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as ParchmentCardDiscoveredEvent;
    return {
      ...gameState,
      lastAddedCards: [],
      onGoingParchment: e.cardInstanceId,
      ...(e.resumePhase !== undefined && { parchmentResumePhase: e.resumePhase }),
      discoveryPile: gameState.discoveryPile.filter(id => id !== e.cardInstanceId),
      phase: Phase.PARCHMENT,
    };
  }
}
