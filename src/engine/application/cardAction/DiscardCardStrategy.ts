import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { discardCards } from '@engine/application/gameStateHelper';
import type { GameState } from '@engine/domain/types';

export class DiscardCardStrategy implements CardActionStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: string;
      sourceInstanceId: number;
      instanceId: number;
    },
  ): GameState {
    return discardCards(gameState, [payload.instanceId]);
  }
}
