import type { GameEventStrategy } from './GameEventStrategy';
import type { GameEvent, GameState, SkipTriggerEvent } from '@engine/domain/types';

export class SkipTriggerStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as SkipTriggerEvent;
    const { [e.triggerId]: _skipped, ...restTriggers } = gameState.triggerPile;
    return { ...gameState, triggerPile: restTriggers };
  }
}
