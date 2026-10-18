import { Phase } from '../enums';
import { clearCampaignPile } from '../state/clearCampaignPile';
import type { GameEvent, GameState } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';

export class GameEndedStrategy implements GameEventStrategy {
  apply(gameState: GameState, _event: GameEvent): GameState {
    return { ...clearCampaignPile(gameState), phase: Phase.GAME_OVER };
  }
}
