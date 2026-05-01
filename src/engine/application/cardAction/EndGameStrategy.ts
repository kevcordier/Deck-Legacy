import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class EndGameStrategy implements CardActionStrategy {
  apply(gameState: GameState): GameState {
    return { ...gameState, phase: Phase.GAME_OVER };
  }
}
