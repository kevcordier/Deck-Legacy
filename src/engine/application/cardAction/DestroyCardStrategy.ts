import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { destroyCards } from '@engine/application/gameStateHelper';
import type { GameState } from '@engine/domain/types';

export class DestroyCardStrategy implements CardActionStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: string;
      sourceInstanceId: number;
      instanceId: number;
    },
  ): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState; // Deep clone to avoid mutating original state
    return { ...gs, ...destroyCards(gs, [payload.instanceId]) };
  }
}
