import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, ResolvedAction } from '@engine/domain/types';

export class SetCumulatedStrategy implements CardActionStrategy {
  applyEffect(gameState: GameState, payload: ResolvedAction): GameState {
    const instanceId = payload.instanceIds?.[0];
    if (instanceId === undefined || !payload.accumulated) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    gs.instances[instanceId].cumulated = {
      ...gs.instances[instanceId].cumulated,
      ...payload.accumulated,
    };
    return { ...gs };
  }
}
