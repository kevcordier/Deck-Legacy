import type { GameEventStrategy } from './GameEventStrategy';
import type { GameEvent, GameState, TriggerEntry, TurnEndedEvent } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class TurnEndedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as TurnEndedEvent;
    const triggerPile = e.onTurnEndedEvents.reduce(
      (acc, { effectDef, sourceInstanceId }) => {
        acc[crypto.randomUUID()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );
    return { ...gameState, triggerPile, phase: Phase.PRETURN };
  }
}
