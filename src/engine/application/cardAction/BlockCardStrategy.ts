import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState } from '@engine/domain/types';

export class BlockCardStrategy implements CardActionStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: string;
      sourceInstanceId: number;
      instanceId: number;
    },
  ): GameState {
    gameState.blockingCards[payload.sourceInstanceId] = payload.instanceId;
    return gameState;
  }
}
