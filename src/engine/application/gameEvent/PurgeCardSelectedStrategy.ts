import type { GameEventStrategy } from './GameEventStrategy';
import type { GameEvent, GameState, PurgeCardSelectedEvent } from '@engine/domain/types';

export class PurgeCardSelectedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as PurgeCardSelectedEvent;
    if (!gameState.purgeState) return gameState;

    return {
      ...gameState,
      purgeState: {
        ...gameState.purgeState,
        selectedCardIds: [...new Set([...gameState.purgeState.selectedCardIds, e.instanceId])],
        completedBatchStarts: [
          ...new Set([...gameState.purgeState.completedBatchStarts, e.batchStart]),
        ],
      },
    };
  }
}
