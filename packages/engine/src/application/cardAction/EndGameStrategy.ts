import { Phase } from '../../domain/enums';
import type { GameState } from '../../domain/types';
import { clearCampaignPile } from '../gameStateHelper';
import type { CardActionStrategy } from './CardActionStrategy';

export class EndGameStrategy implements CardActionStrategy {
  apply(gameState: GameState): GameState {
    return { ...clearCampaignPile(gameState), phase: Phase.GAME_OVER };
  }
}
