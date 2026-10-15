import type { CardDef, GameState, ResolvedActionEffect } from '../../domain/types';
import { getActiveState, isPermanent } from '../cardHelpers';
import { removeFromDiscovery } from '../gameStateHelper';
import type { CardActionStrategy } from './CardActionStrategy';

export class DiscoverCardStrategy implements CardActionStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  apply(_gameState: GameState, payload: ResolvedActionEffect): GameState {
    const ids = payload.instanceIds ?? [];
    const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
    removeFromDiscovery(gameState, ids);

    gameState.lastAddedCards = [];
    ids.forEach(instanceId => {
      const cardDef = this.cardDefs[gameState.instances[instanceId].cardId];

      if (cardDef.parchmentCard) {
        gameState.onGoingParchment = instanceId;
      } else {
        gameState.lastAddedCards.push(instanceId);

        if (isPermanent(getActiveState(gameState.instances[instanceId], this.cardDefs))) {
          gameState.permanents.push(instanceId);
          const passives = getActiveState(gameState.instances[instanceId], this.cardDefs)?.passives;
          if (passives) {
            passives.forEach(passive => {
              gameState.boardEffects[instanceId] = [
                ...(gameState.boardEffects[instanceId] ?? []),
                passive,
              ];
            });
          }
        } else {
          gameState.discardPile = [...new Set([...gameState.discardPile, instanceId])];
        }
      }
    });

    return gameState;
  }
}
