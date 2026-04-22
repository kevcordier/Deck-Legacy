import type { GameEventStrategy } from './GameEventStrategy';
import { drawCards, endTurn } from '@engine/application/gameStateHelper';
import type {
  CardDef,
  GameEvent,
  GameState,
  TriggerEntry,
  TurnStartedEvent,
} from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class TurnStartedStrategy implements GameEventStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as TurnStartedEvent;
    const triggerPile = e.onPlayEvents.reduce(
      (acc, { effectDef, sourceInstanceId }) => {
        acc[crypto.randomUUID()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );
    const afterDraw = drawCards(
      endTurn({ ...gameState, lastAddedIds: [], turn: e.turn }, this.cardDefs),
      e.turnCards,
    );
    return { ...gameState, ...afterDraw, triggerPile, phase: Phase.PLAYING };
  }
}
