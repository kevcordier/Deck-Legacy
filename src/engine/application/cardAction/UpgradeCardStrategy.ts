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
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState; // Deep clone to avoid mutating original state
    gs.instances[payload.instanceId].stateId = payload.stateId;
    return { ...gs, ...discardCards(gs, [payload.instanceId]) };
  }
}
