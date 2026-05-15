import type { GameEventStrategy } from './GameEventStrategy';
import { getActiveState, getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { destroyCards, discardCards, spendResources } from '@engine/application/gameStateHelper';
import { Trigger } from '@engine/domain/enums';
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
    const upgradedState = { ...triggerState, instances: updatedInstances };
    if (getActiveState(upgradedState.instances[e.cardInstanceId], this.cardDefs)?.permanent) {
      return {
        ...upgradedState,
        permanents: [...new Set([...upgradedState.permanents, e.cardInstanceId])],
        board: upgradedState.board.filter(id => id !== e.cardInstanceId),
      };
    }

    return {
      ...upgradedState,
      ...discardCards(upgradedState, [e.cardInstanceId], this.cardDefs, this.stickerDefs),
      permanents: upgradedState.permanents.filter(id => id !== e.cardInstanceId),
    };
  }
}
