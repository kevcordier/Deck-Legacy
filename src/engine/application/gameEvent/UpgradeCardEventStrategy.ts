import type { GameEventStrategy } from './GameEventStrategy';
import { discardCards, spendResources } from '@engine/application/gameStateHelper';
import type { GameEvent, GameState, UpgradeCardEvent } from '@engine/domain/types';

export class UpgradeCardEventStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as UpgradeCardEvent;
    const updatedInstances = {
      ...gameState.instances,
      [e.cardInstanceId]: { ...gameState.instances[e.cardInstanceId], stateId: e.stateId },
    };
    const withInstance = { ...gameState, instances: updatedInstances };
    return {
      ...withInstance,
      ...discardCards(spendResources(withInstance, e.cost), [e.cardInstanceId]),
    };
  }
}
