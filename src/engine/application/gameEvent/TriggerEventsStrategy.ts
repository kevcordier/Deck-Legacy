import type { GameEventStrategy } from '@engine/application/gameEvent/GameEventStrategy';
import type { GameEvent, GameState, TriggerEventsEvent } from '@engine/domain/types';

export class TriggerEventsStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as TriggerEventsEvent;
    return {
      ...gameState,
      triggerPile: e.triggerPile,
      phase: e.phase,
    };
  }
}
