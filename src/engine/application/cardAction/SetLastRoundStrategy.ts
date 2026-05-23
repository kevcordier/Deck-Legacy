import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, ResolvedActionEffect } from '@engine/domain/types';

export class SetLastRoundStrategy implements CardActionStrategy {
  apply(gameState: GameState, _payload: ResolvedActionEffect): GameState {
    return {
      ...gameState,
      isLastRound: true,
    };
  }
}
