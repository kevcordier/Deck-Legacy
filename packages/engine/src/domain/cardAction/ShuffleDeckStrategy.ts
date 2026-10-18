import { shuffle } from '../random';
import type { GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

export class ShuffleDeckStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const salt = `${payload.id}:${gameState.round}:${gameState.turn}`;
    if (payload.deck === 'discard') {
      gameState.discardPile = shuffle(gameState.discardPile, gameState.seed, `discard:${salt}`);
      return gameState;
    }

    gameState.drawPile = shuffle(gameState.drawPile, gameState.seed, `draw:${salt}`);
    return gameState;
  }
}
