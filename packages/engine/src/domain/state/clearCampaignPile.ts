import type { GameState } from '../types';

/**
 * The end of a game empties the campaign pile. Games started with a single discovery pile keep it:
 * it also holds the cards that effects discover later (EDR-045).
 */
export function clearCampaignPile(gameState: GameState): GameState {
  return gameState.discoverablePile ? { ...gameState, discoveryPile: [] } : gameState;
}
