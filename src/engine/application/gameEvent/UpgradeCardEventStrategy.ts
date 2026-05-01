import type { GameEventStrategy } from './GameEventStrategy';
import { getActiveState } from '@engine/application/cardHelpers';
import { TurnEndedStrategy } from '@engine/application/gameEvent/TurnEndedStrategy';
import { discardCards, spendResources } from '@engine/application/gameStateHelper';
import type {
  CardDef,
  GameEvent,
  GameState,
  Sticker,
  UpgradeCardEvent,
} from '@engine/domain/types';

export class UpgradeCardEventStrategy implements GameEventStrategy {
  constructor(
    private cardDefs: Record<number, CardDef>,
    private stickerDefs: Record<number, Sticker>,
  ) {}

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

    const newState = {
      ...upgradedState,
      ...discardCards(upgradedState, [e.cardInstanceId]),
    };

    return new TurnEndedStrategy(this.cardDefs, this.stickerDefs).apply(newState);
  }
}
