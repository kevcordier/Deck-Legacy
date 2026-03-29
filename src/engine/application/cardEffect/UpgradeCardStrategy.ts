import type { CardEffectStrategy } from '@engine/application/cardEffect/CardEffectStrategy';
import type { GameState } from '@engine/domain/types';
import { discardCards } from '@engine/application/gameStateHelper';

export class UpgradeCardStrategy implements CardEffectStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      cardId: string;
      upgradedTo: number;
    },
  ): GameState {
    const cardInstance = gameState.instances[payload.cardId];
    if (cardInstance === undefined) {
      throw new Error(`Card with id ${payload.cardId} not found in instances`);
    }
    cardInstance.stateId = payload.upgradedTo;
    gameState = discardCards(gameState, [payload.cardId]);
    return gameState;
  }
}
