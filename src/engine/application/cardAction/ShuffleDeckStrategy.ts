import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { GameState, ResolvedActionEffect } from '@engine/domain/types';

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    // eslint-disable-next-line sonarjs/pseudo-random
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export class ShuffleDeckStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    if (payload.deck === 'discard') {
      gameState.discardPile = shuffle(gameState.discardPile);
      return gameState;
    }

    gameState.drawPile = shuffle(gameState.drawPile);
    return gameState;
  }
}
