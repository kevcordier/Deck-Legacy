import type { GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

/** Adds the chosen cards to the cards selected for the current purge. */
export class AddToPurgeStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const purgeState = gameState.purgeState;
    const ids = payload.instanceIds ?? [];
    if (!purgeState || ids.length === 0) return gameState;

    return {
      ...gameState,
      purgeState: {
        ...purgeState,
        selectedCardIds: [...new Set([...purgeState.selectedCardIds, ...ids])],
      },
    };
  }
}
