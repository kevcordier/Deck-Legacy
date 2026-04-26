import type { GameEventStrategy } from './GameEventStrategy';
import { getActiveState } from '@engine/application/cardHelpers';
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

    e.turnCards.forEach(instanceId => {
      const passives = getActiveState(gameState.instances[instanceId], this.cardDefs)?.passives;
      if (!passives) return;
      passives.forEach(passive => {
        gameState.boardEffects[instanceId] = [
          ...(gameState.boardEffects[instanceId] ?? []),
          passive,
        ];
      });
    });

    const afterDraw = drawCards(
      endTurn({ ...gameState, lastAddedIds: [], turn: e.turn }, this.cardDefs),
      e.turnCards,
    );
    return { ...gameState, ...afterDraw, triggerPile, phase: Phase.PLAYING };
  }
}
