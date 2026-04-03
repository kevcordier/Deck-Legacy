import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState } from '@engine/domain/types';

export class BlockCardStrategy implements CardActionStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: string;
      sourceInstanceId: number;
      instanceId?: number;
    },
  ): GameState {
    if (payload.instanceId === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState; // Deep clone to avoid mutating original state
    gs.blockingCards[payload.sourceInstanceId] = payload.instanceId;
    return {
      ...gs,
      blockingCards: gs.blockingCards,
    };
  }
}
