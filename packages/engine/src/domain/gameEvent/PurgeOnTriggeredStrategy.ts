import type { GameEvent, GameState, PurgeOnTriggeredEvent } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';

export class PurgeOnTriggeredStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as PurgeOnTriggeredEvent;
    if (!gameState.purgeState) return gameState;

    return {
      ...gameState,
      triggerPile: { ...gameState.triggerPile, ...e.triggers },
      purgeState: {
        ...gameState.purgeState,
        onPurgeTriggered: true,
      },
    };
  }
}
