import type { GameState, ResolvedActionEffect } from '../../domain/types';
import type { CardActionStrategy } from './CardActionStrategy';

export class AddCumulatedStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceId = payload.instanceIds?.[0];
    if (instanceId === undefined || payload.value === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    gs.instances[instanceId].cumulated += payload.value;
    return { ...gs };
  }
}
