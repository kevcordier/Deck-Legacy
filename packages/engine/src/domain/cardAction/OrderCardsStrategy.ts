import { destroyCards } from '../state/destroyCards';
import type { GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

/**
 * The cards looked at go back on top of the box in the player's order (`instanceIds`); those in
 * `destroyedIds` are destroyed (Performance).
 */
export class OrderCardsStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const order = payload.instanceIds ?? [];
    const destroyed = payload.destroyedIds ?? [];
    if (order.length === 0 && destroyed.length === 0) return gameState;
    const handled = new Set([...order, ...destroyed]);
    const pileKey = gameState.discoverablePile ? 'discoverablePile' : 'discoveryPile';
    const pile = gameState[pileKey] ?? [];
    const reordered = {
      ...gameState,
      [pileKey]: [...order, ...pile.filter(id => !handled.has(id))],
    };
    return destroyed.length > 0 ? destroyCards(reordered, destroyed) : reordered;
  }
}
