import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { type ActionType, PassiveType } from '@engine/domain/enums';
import type { GameState } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export class BlockCardStrategy implements CardActionStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: ActionType;
      sourceInstanceId: number;
      instanceId?: number;
    },
  ): GameState {
    if (payload.instanceId === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState; // Deep clone to avoid mutating original state
    gs.boardEffects[payload.sourceInstanceId] = [
      ...(gs.boardEffects[payload.sourceInstanceId] || []),
      {
        ...CardPassives[PassiveType.BLOCK],
        cards: { ids: [payload.instanceId] },
      },
    ];
    return gs;
  }
}
