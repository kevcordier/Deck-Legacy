import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, ResolvedActionEffect } from '@engine/domain/types';

export class AddCumulatedStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceId = payload.instanceIds?.[0];
    if (instanceId === undefined || !payload.accumulated) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    const current = gs.instances[instanceId].cumulated;
    for (const [key, value] of Object.entries(payload.accumulated)) {
      current[key] = (current[key] ?? 0) + value;
    }
    return { ...gs };
  }
}
