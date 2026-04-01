import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState } from '@engine/domain/types';
import { discardCards } from '@engine/application/gameStateHelper';

export class UpgradeCardStrategy implements CardActionStrategy {
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
    gameState = discardCards(gameState, [payload.instanceId]);
    return gameState;
  }
}
