import type { GameEventStrategy } from './GameEventStrategy';
import { getActiveState } from '@engine/application/cardHelpers';
import { discardCards, spendResources } from '@engine/application/gameStateHelper';
import type { CardDef, GameEvent, GameState, UpgradeCardEvent } from '@engine/domain/types';

export class UpgradeCardEventStrategy implements GameEventStrategy {
  constructor(private cardDefs: Record<number, CardDef>) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as UpgradeCardEvent;
    const updatedInstances = {
      ...gameState.instances,
      [e.cardInstanceId]: { ...gameState.instances[e.cardInstanceId], stateId: e.stateId },
    };
    const upgradedState = { ...spendResources(gameState, e.cost), instances: updatedInstances };
    if (getActiveState(upgradedState.instances[e.cardInstanceId], this.cardDefs)?.permanent) {
      return {
        ...upgradedState,
        permanents: [...upgradedState.permanents, e.cardInstanceId],
        board: upgradedState.board.filter(id => id !== e.cardInstanceId),
      };
    }

    return {
      ...upgradedState,
      ...discardCards(upgradedState, [e.cardInstanceId]),
    };
  }
}
