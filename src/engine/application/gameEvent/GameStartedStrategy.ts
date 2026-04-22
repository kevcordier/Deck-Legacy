import type { GameEventStrategy } from './GameEventStrategy';
import type { GameEvent, GameStartedEvent, GameState } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class GameStartedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as GameStartedEvent;
    return {
      ...gameState,
      instances: Object.fromEntries(e.cardInstances.map(inst => [inst.id, inst])),
      drawPile: e.initialDeck,
      stickerStock: e.stickerStock,
      discoveryPile: e.discoveryPile,
      round: 0,
      turn: 0,
      phase: Phase.PREGAME,
    };
  }
}
