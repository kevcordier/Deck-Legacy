import type { GameEvent, GameState, PurgePermanentSelectedEvent } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';

export class PurgePermanentSelectedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as PurgePermanentSelectedEvent;
    if (!gameState.purgeState) return gameState;

    return {
      ...gameState,
      purgeState: {
        ...gameState.purgeState,
        selectedPermanentIds: [
          ...new Set([...gameState.purgeState.selectedPermanentIds, e.instanceId]),
        ],
      },
    };
  }
}
