import { removeFromDiscovery } from '../state/removeFromDiscovery';
import type { GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

/** Where the card goes in `pile`: `'index'` = before the first card with a higher instance id. */
function insertionIndex(
  pile: number[],
  instanceId: number,
  position: number | 'top' | 'bottom' | 'index',
): number {
  if (position === 'top') return 0;
  if (position === 'bottom') return pile.length;
  if (position === 'index') {
    const next = pile.findIndex(id => id > instanceId);
    return next < 0 ? pile.length : next;
  }
  return position;
}

export class PlaceCardInPileStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceIds = payload.instanceIds;
    if (instanceIds === undefined || payload.position === undefined) return gameState;
    const position = payload.position;
    instanceIds.forEach(instanceId => {
      const { [instanceId]: _placed, ...restEffects } = gameState.boardEffects;
      gameState.boardEffects = restEffects;
      gameState.board = gameState.board.filter(c => c !== instanceId);
      gameState.drawPile = gameState.drawPile.filter(c => c !== instanceId);
      removeFromDiscovery(gameState, [instanceId]);
      gameState.discardPile = gameState.discardPile.filter(c => c !== instanceId);

      // "Discovery" is the campaign pile: the card comes back at the next rounds.
      let pile = gameState.drawPile;
      if (payload.deck === 'discovery') pile = gameState.discoveryPile;
      if (payload.deck === 'discard') pile = gameState.discardPile;
      if (payload.deck === 'board') pile = gameState.board;
      pile.splice(insertionIndex(pile, instanceId, position), 0, instanceId);
    });
    return gameState;
  }
}
