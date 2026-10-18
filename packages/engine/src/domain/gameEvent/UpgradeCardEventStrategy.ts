import { getActiveState, getInstancesTriggerEffects, isPermanent } from '../cardHelpers';
import { GameEventType, Trigger } from '../enums';
import {
  destroyCards,
  discardCards,
  spendResources,
  syncInstancePassivesInBoardEffects,
} from '../gameStateHelper';
import type { CardDef, GameEvent, GameState, Sticker, UpgradeCardEvent } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';
import { TurnEndedStrategy } from './TurnEndedStrategy';

export class UpgradeCardEventStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as UpgradeCardEvent;
    const paidState = destroyCards(
      discardCards(gameState, e.discardedCardIds ?? [], this.cardDefs, this.stickerDefs),
      e.destroyedCardIds ?? [],
    );
    const afterCostState = { ...spendResources(paidState, e.cost) };
    const upgradedInstanceBeforeStateChange = afterCostState.instances[e.cardInstanceId];
    const onUpgradeTriggers = upgradedInstanceBeforeStateChange
      ? getInstancesTriggerEffects(
          [upgradedInstanceBeforeStateChange],
          this.cardDefs,
          this.stickerDefs,
          Trigger.ON_UPGRADE,
          afterCostState,
        )
      : [];
    const triggerState =
      onUpgradeTriggers.length > 0
        ? (() => {
            const gs = JSON.parse(JSON.stringify(afterCostState)) as GameState;
            onUpgradeTriggers.forEach(({ effectDef, sourceInstanceId }) => {
              gs.triggerPile[crypto.randomUUID()] = { effectDef, sourceInstanceId };
            });
            return gs;
          })()
        : afterCostState;
    const updatedInstances = {
      ...triggerState.instances,
      [e.cardInstanceId]: { ...triggerState.instances[e.cardInstanceId], stateId: e.stateId },
    };
    const upgradedState = syncInstancePassivesInBoardEffects(
      { ...triggerState, instances: updatedInstances },
      e.cardInstanceId,
      this.cardDefs,
    );

    let newState: GameState;
    if (isPermanent(getActiveState(upgradedState.instances[e.cardInstanceId], this.cardDefs))) {
      newState = {
        ...upgradedState,
        permanents: [...new Set([...upgradedState.permanents, e.cardInstanceId])],
        board: upgradedState.board.filter(id => id !== e.cardInstanceId),
      };
    } else {
      newState = {
        ...upgradedState,
        ...discardCards(upgradedState, [e.cardInstanceId], this.cardDefs, this.stickerDefs),
        permanents: upgradedState.permanents.filter(id => id !== e.cardInstanceId),
      };
    }

    return new TurnEndedStrategy(this.cardDefs, this.stickerDefs).apply(newState, {
      id: '',
      type: GameEventType.TURN_ENDED,
      timestamp: Date.now(),
      endTurnTrigger: e.endTurnTrigger,
    } as GameEvent);
  }
}
