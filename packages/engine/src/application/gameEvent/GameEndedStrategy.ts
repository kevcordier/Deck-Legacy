import { Phase } from '../../domain/enums';
import type { GameEvent, GameState } from '../../domain/types';
import type { GameEventStrategy } from './GameEventStrategy';

export class GameEndedStrategy implements GameEventStrategy {
  apply(gameState: GameState, _event: GameEvent): GameState {
    return {
      ...gameState,
      phase: Phase.GAME_OVER,
    };
  }
}
