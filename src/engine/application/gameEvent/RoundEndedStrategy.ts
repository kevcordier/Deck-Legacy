import type { GameEventStrategy } from './GameEventStrategy';
import { discoverCards } from '@engine/application/gameStateHelper';
import type { CardDef, GameState, Sticker } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class RoundEndedStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState): GameState {
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
      boardEffects: {},
      discardPile: [...gameState.board, ...gameState.discardPile],
      board: [],
      phase: Phase.PREROUND,
    };
  }
}
