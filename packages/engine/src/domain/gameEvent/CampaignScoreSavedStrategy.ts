import { Phase } from '../enums';
import type { CampaignScoreSavedEvent, GameEvent, GameState } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';

export class CampaignScoreSavedStrategy implements GameEventStrategy {
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as CampaignScoreSavedEvent;

    return {
      ...gameState,
      campaignScores: {
        ...gameState.campaignScores,
        [e.segment]: e.score,
      },
      phase: e.openExpansionChoice ? Phase.EXPANSION_CHOICE : gameState.phase,
    };
  }
}
