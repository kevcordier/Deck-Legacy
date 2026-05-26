import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { Phase } from '@engine/domain/enums';
import type { GameState } from '@engine/domain/types';

export class EndGameStrategy implements CardActionStrategy {
  apply(gameState: GameState): GameState {
    return { ...gameState, phase: Phase.GAME_OVER };
  }
}
