import type { GameEventStrategy } from './GameEventStrategy';
import { createInstance } from '@engine/application/factory';
import type { CardDef, GameEvent, GameStartedEvent, GameState } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class GameStartedStrategy implements GameEventStrategy {
  constructor(private readonly defs: Record<number, CardDef>) {}
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as GameStartedEvent;
    const allInstances = e.deck.map(entry =>
      createInstance(entry.id, entry.cardId, this.defs[entry.cardId].states[0].id, this.defs),
    );
    return {
      ...gameState,
      instances: Object.fromEntries(
        [...e.initialDeck, ...e.discoveryPile].map(inst => [inst, allInstances[inst - 1]]),
      ),
      drawPile: e.initialDeck,
      stickerStock: e.stickerStock,
      discoveryPile: e.discoveryPile,
      round: 0,
      turn: 0,
      phase: Phase.PRE_GAME,
    };
  }
}
