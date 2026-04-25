import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { discardCards } from '@engine/application/gameStateHelper';
import type { GameState, ResolvedActionEffect } from '@engine/domain/types';

export class UpgradeCardStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceId = payload.instanceIds?.[0];
    if (instanceId === undefined || payload.stateId === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    gs.instances[instanceId].stateId = payload.stateId;
    return { ...gs, ...discardCards(gs, [instanceId]) };
  }
}
