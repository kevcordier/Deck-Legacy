import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { discardCards } from '@engine/application/gameStateHelper';
import type { ActionType } from '@engine/domain/enums';
import type { GameState } from '@engine/domain/types';

export class DiscardCardStrategy implements CardActionStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: ActionType;
      sourceInstanceId: number;
      instanceId: number;
    },
  ): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState; // Deep clone to avoid mutating original state
    return { ...gs, ...discardCards(gs, [payload.instanceId]) };
  }
}
