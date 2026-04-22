import type { GameEventStrategy } from './GameEventStrategy';
import { destroyCards, discardCards, spendResources } from '@engine/application/gameStateHelper';
import type { GameEvent, GameState, UseCardEffectEvent } from '@engine/domain/types';

export class UseCardEffectStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as UseCardEffectEvent;

    const discardedCardIds = [...(e.resolvedCost.discardedCardIds ?? [])];
    const destroyedCardIds = [...(e.resolvedCost.destroyedCardIds ?? [])];
    if (e.isDiscarded) discardedCardIds.push(e.sourceInstanceId);
    else if (e.isDestroyed) destroyedCardIds.push(e.sourceInstanceId);

    const stateWithChanges = { ...gameState, ...e.gameStateChanges };

    const afterPipeline = {
      ...stateWithChanges,
      ...destroyCards(
        discardCards(spendResources(stateWithChanges, e.resolvedCost.resources), discardedCardIds),
        destroyedCardIds,
      ),
    };

    const { [e.triggerId]: _used, ...restTriggers } = afterPipeline.triggerPile;

    return { ...afterPipeline, triggerPile: restTriggers };
  }
}
