import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, ResolvedActionEffect } from '@engine/domain/types';

function removeFromArray(values: number[], ids: number[]): number[] {
  return values.filter(id => !ids.includes(id));
}

export class SaveFromPurgeStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const purgeState = gameState.purgeState;
    if (!purgeState) return gameState;

    const explicitIds = payload.instanceIds ?? [];
    const sourceId = payload.sourceInstanceId;

    const selectedPool = [...purgeState.selectedCardIds, ...purgeState.selectedPermanentIds].filter(
      id => id !== sourceId,
    );

    const idsToSave =
      explicitIds.length > 0 ? explicitIds : selectedPool.slice(0, Math.max(0, payload.value ?? 0));

    if (idsToSave.length === 0) return gameState;

    return {
      ...gameState,
      purgeState: {
        ...purgeState,
        selectedCardIds: removeFromArray(purgeState.selectedCardIds, idsToSave),
        selectedPermanentIds: removeFromArray(purgeState.selectedPermanentIds, idsToSave),
      },
    };
  }
}
