import type { GameEventStrategy } from './GameEventStrategy';
import { Phase } from '@engine/domain/enums';
import type { GameEvent, GameState } from '@engine/domain/types';

export class GameEndedStrategy implements GameEventStrategy {
  apply(gameState: GameState, _event: GameEvent): GameState {
    return {
      ...gameState,
      phase: Phase.GAME_OVER,
    };
  }
}
