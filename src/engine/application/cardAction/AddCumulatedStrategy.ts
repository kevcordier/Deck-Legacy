import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, ResolvedAction } from '@engine/domain/types';

export class AddCumulatedStrategy implements CardActionStrategy {
  applyEffect(gameState: GameState, payload: ResolvedAction): GameState {
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
