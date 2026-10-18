import type { GameParameters, GameState } from '../types';

/**
 * The round just played is the last one: marked as such, or (two packs, EDR-045) the campaign
 * pile holds fewer cards than the next round discovers.
 */
export const isLastRound = (gameState: GameState, parameters: GameParameters): boolean =>
  gameState.isLastRound ||
  (gameState.discoverablePile !== undefined &&
    gameState.discoveryPile.length < parameters.discoverPerRound);
