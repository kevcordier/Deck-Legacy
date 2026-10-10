import type { GameState, ResolvedActionEffect } from '../../domain/types';
import type { CardActionStrategy } from './CardActionStrategy';

export class SetLastRoundStrategy implements CardActionStrategy {
  apply(gameState: GameState, _payload: ResolvedActionEffect): GameState {
    return {
      ...gameState,
      isLastRound: true,
    };
  }
}
