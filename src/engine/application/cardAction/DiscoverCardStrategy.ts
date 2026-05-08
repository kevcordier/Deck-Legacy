import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getActiveState, getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { Trigger } from '@engine/domain/enums';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '@engine/domain/types';

export class DiscoverCardStrategy implements CardActionStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(_gameState: GameState, payload: ResolvedActionEffect): GameState {
    const ids = payload.instanceIds ?? [];
    const gameState = JSON.parse(JSON.stringify(_gameState)) as GameState;
    gameState.discoveryPile = [...new Set(gameState.discoveryPile.filter(id => !ids.includes(id)))];
    getInstancesTriggerEffects(
      ids.map(id => gameState.instances[id]),
      this.cardDefs,
      this.stickerDefs,
      Trigger.ON_DISCOVER,
      gameState,
    ).forEach(effectDef => {
      gameState.triggerPile[crypto.randomUUID()] = effectDef;
    });

    gameState.lastAddedCards = [];
    ids.forEach(instanceId => {
      const cardDef = this.cardDefs[gameState.instances[instanceId].cardId];

      if (!cardDef.parchmentCard) {
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
