import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState } from '@engine/domain/types';

export class ChoseStateStrategy implements CardActionStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: string;
      sourceInstanceId: number;
      instanceId: number;
      stateId: number;
    },
  ): GameState {
    gameState.instances[payload.instanceId].stateId = payload.stateId;
    return gameState;
  }
}
