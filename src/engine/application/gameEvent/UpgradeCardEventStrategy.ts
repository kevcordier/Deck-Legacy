import type { GameEventStrategy } from './GameEventStrategy';
import { getActiveState } from '@engine/application/cardHelpers';
import { TurnEndedStrategy } from '@engine/application/gameEvent/TurnEndedStrategy';
import { destroyCards, discardCards, spendResources } from '@engine/application/gameStateHelper';
import type {
  CardDef,
  GameEvent,
  GameState,
  Sticker,
  UpgradeCardEvent,
} from '@engine/domain/types';

export class UpgradeCardEventStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as UpgradeCardEvent;
    const paidState = destroyCards(
      discardCards(gameState, e.discardedCardIds ?? []),
      e.destroyedCardIds ?? [],
    );
    const updatedInstances = {
      ...paidState.instances,
      [e.cardInstanceId]: { ...paidState.instances[e.cardInstanceId], stateId: e.stateId },
    };
    const upgradedState = { ...spendResources(paidState, e.cost), instances: updatedInstances };
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
