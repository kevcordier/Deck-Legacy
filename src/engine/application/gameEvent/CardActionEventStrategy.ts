import type { GameEventStrategy } from './GameEventStrategy';
import type { CardActionEvent, GameEvent, GameState } from '@engine/domain/types';

export class CardActionEventStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as CardActionEvent;
    return { ...gameState, ...e.gameStateChanges };
  }
}
