import type { GameEventStrategy } from './GameEventStrategy';
import { getActiveState } from '@engine/application/cardHelpers';
import { drawCards } from '@engine/application/gameStateHelper';
import { PassiveType } from '@engine/domain/enums';
import type {
  AdvanceEvent,
  CardDef,
  GameEvent,
  GameState,
  TriggerEntry,
} from '@engine/domain/types';

export class AdvanceStrategy implements GameEventStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as AdvanceEvent;
    if (
      Object.values(gameState.boardEffects).some(effect =>
        effect.some(p => p.type === PassiveType.CANT_ADVANCE),
      )
    ) {
      return gameState;
    }

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
