import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getActiveState } from '@engine/application/cardHelpers';
import type { CardDef, GameState, ResolvedActionEffect } from '@engine/domain/types';

export class DiscoverCardStrategy implements CardActionStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  apply(_gameState: GameState, payload: ResolvedActionEffect): GameState {
    const ids = payload.instanceIds ?? [];
    const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
    gameState.discoveryPile = [...new Set(gameState.discoveryPile.filter(id => !ids.includes(id)))];

    gameState.lastAddedCards = [];
    ids.forEach(instanceId => {
      const cardDef = this.cardDefs[gameState.instances[instanceId].cardId];

      if (cardDef.parchmentCard) {
        gameState.onGoingParchment = instanceId;
      } else {
        gameState.lastAddedCards.push(instanceId);

        if (getActiveState(gameState.instances[instanceId], this.cardDefs)?.permanent) {
          gameState.permanents.push(instanceId);
        } else {
          gameState.discardPile = [...new Set([...gameState.discardPile, instanceId])];
        }
      }
    });

    return gameState;
  }
}
