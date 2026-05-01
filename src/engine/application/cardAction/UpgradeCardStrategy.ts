import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getActiveState } from '@engine/application/cardHelpers';
import { discardCards } from '@engine/application/gameStateHelper';
import type { CardDef, GameState, ResolvedActionEffect } from '@engine/domain/types';

export class UpgradeCardStrategy implements CardActionStrategy {
  constructor(private cardDefs: Record<number, CardDef>) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceId = payload.instanceIds?.[0];
    if (instanceId === undefined || payload.stateId === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    gs.instances[instanceId].stateId = payload.stateId;
    // if new state is permanent add it to permanents pile
    if (getActiveState(gs.instances[instanceId], this.cardDefs)?.permanent) {
      return {
        ...gs,
        permanents: [...gs.permanents, instanceId],
        board: gs.board.filter(id => id !== instanceId),
      };
    }

    return { ...gs, ...discardCards(gs, [instanceId]) };
  }
}
