import { getInstancesTriggerEffects } from '../cards/getInstancesTriggerEffects';
import { getActiveState } from '../cards/selection/getActiveState';
import { isPermanent } from '../cards/selection/isPermanent';
import { GameEventType, Trigger } from '../enums';
import { environment } from '../environment/environment';
import { destroyCards } from '../state/destroyCards';
import { discardCards } from '../state/discardCards';
import { spendResources } from '../state/spendResources';
import { syncInstancePassivesInBoardEffects } from '../state/syncInstancePassivesInBoardEffects';
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
              gs.triggerPile[environment.newId()] = { effectDef, sourceInstanceId, endsTurn: true };
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

    if (e.keepsTurn) return newState;
    return new TurnEndedStrategy(this.cardDefs, this.stickerDefs).apply(newState, {
      id: '',
      type: GameEventType.TURN_ENDED,
      timestamp: environment.now(),
      endTurnTrigger: e.endTurnTrigger,
    } as GameEvent);
  }
}
