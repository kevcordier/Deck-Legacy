import type { GameEvent, GameState, StoryAdvancedEvent } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';

/** The start of a round discovers the first cards of the campaign pile. */
export class StoryAdvancedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as StoryAdvancedEvent;
    return {
      ...gameState,
      discoveryPile: gameState.discoveryPile.filter(id => !e.discoveredIds.includes(id)),
      lastAddedCards: e.discoveredIds,
    };
  }
}
