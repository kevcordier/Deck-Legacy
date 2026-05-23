import type { GameEventStrategy } from './GameEventStrategy';
import type { GameEvent, GameState } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class GameEndedStrategy implements GameEventStrategy {
  apply(gameState: GameState, _event: GameEvent): GameState {
    return {
      ...gameState,
      phase: Phase.GAME_OVER,
    };
  }
}
