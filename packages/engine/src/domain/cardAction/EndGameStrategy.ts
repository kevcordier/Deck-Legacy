import { Phase } from '../enums';
import { clearCampaignPile } from '../gameStateHelper';
import type { GameState } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

export class EndGameStrategy implements CardActionStrategy {
  apply(gameState: GameState): GameState {
    return { ...clearCampaignPile(gameState), phase: Phase.GAME_OVER };
  }
}
