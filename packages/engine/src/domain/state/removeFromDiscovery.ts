import type { GameState } from '../types';

/** Removes cards from the campaign and discoverable piles (mutates `gameState`). */
export function removeFromDiscovery(gameState: GameState, ids: readonly number[]): void {
  gameState.discoveryPile = gameState.discoveryPile.filter(id => !ids.includes(id));
  if (gameState.discoverablePile) {
    gameState.discoverablePile = gameState.discoverablePile.filter(id => !ids.includes(id));
  }
}
