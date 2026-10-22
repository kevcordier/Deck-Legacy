import { getTriggerEntries } from '../cards/getTriggerEntries';
import { getActiveState } from '../cards/selection/getActiveState';
import { isPermanent } from '../cards/selection/isPermanent';
import { Trigger } from '../enums';
import { removeFromDiscovery } from '../state/removeFromDiscovery';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

export class DiscoverCardStrategy implements CardActionStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker> = {},
  ) {}

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

    // "When discovered" effects (Cursed Lands)
    gameState.triggerPile = {
      ...gameState.triggerPile,
      ...getTriggerEntries(ids, Trigger.ON_DISCOVER, gameState, this.cardDefs, this.stickerDefs),
    };
    return gameState;
  }
}
