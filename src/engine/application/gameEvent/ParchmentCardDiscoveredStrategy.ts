import type { GameEventStrategy } from './GameEventStrategy';
import type {
  CardDef,
  GameEvent,
  GameState,
  ParchmentCardDiscoveredEvent,
} from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class ParchmentCardDiscoveredStrategy implements GameEventStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as ParchmentCardDiscoveredEvent;
    this.cardDefs[gameState.instances[e.cardInstanceId].cardId].states[0].actions?.forEach(
      effectDef => {
        gameState.triggerPile[crypto.randomUUID()] = {
          effectDef,
          sourceInstanceId: e.cardInstanceId,
        };
      },
    );

    return {
      ...gameState,
      lastAddedCards: [],
      discoveryPile: gameState.discoveryPile.filter(id => id !== e.cardInstanceId),
      phase: Phase.PARCHMENT,
    };
  }
}
