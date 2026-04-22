import type { GameEventStrategy } from './GameEventStrategy';
import { drawCards } from '@engine/application/gameStateHelper';
import type { AdvanceEvent, GameEvent, GameState, TriggerEntry } from '@engine/domain/types';

export class AdvanceStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as AdvanceEvent;
    const triggerPile = e.onPlayEvents.reduce(
      (acc, { effectDef, sourceInstanceId }) => {
        acc[crypto.randomUUID()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );
    return { ...gameState, ...drawCards(gameState, e.turnCards), triggerPile };
  }
}
