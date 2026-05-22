import type { GameEventStrategy } from './GameEventStrategy';
import type { CampaignScoreSavedEvent, GameEvent, GameState } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

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
