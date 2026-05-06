import type { GameEventStrategy } from './GameEventStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { discoverCards } from '@engine/application/gameStateHelper';
import { Trigger } from '@engine/domain/enums';
import type { CardDef, GameState, Sticker } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class RoundEndedStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState): GameState {
    const allRoundInstances = [...gameState.permanents, ...gameState.board].map(
      id => gameState.instances[id],
    );
    getInstancesTriggerEffects(
      allRoundInstances,
      this.cardDefs,
      this.stickerDefs,
      Trigger.END_OF_ROUND,
      gameState,
    ).forEach(({ effectDef, sourceInstanceId }) => {
      gameState.triggerPile[crypto.randomUUID()] = { effectDef, sourceInstanceId };
    });

    const lastAddedCards: number[] = [];
    const discoveredCard = gameState.discoveryPile.slice(0, 2);

    for (const cardId of discoveredCard) {
      lastAddedCards.push(cardId);
      const cardInstance = gameState.instances[cardId];
      const cardDef = this.cardDefs[cardInstance.cardId];

      if (cardDef.parchmentCard) break;
    }

    gameState = discoverCards(gameState, lastAddedCards, this.cardDefs, this.stickerDefs);

    return {
      ...gameState,
      discardPile: [...gameState.board, ...gameState.discardPile],
      board: [],
      phase: Phase.PREROUND,
    };
  }
}
