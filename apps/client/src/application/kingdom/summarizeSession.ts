import type { GameSession } from '@deck-legacy/engine/application/session/GameSession';
import { Phase } from '@deck-legacy/engine/domain/enums';
import type { KingdomSummary } from '@domain/kingdom/KingdomSummary';

/** Scores shown on the home page, computed from the game being played. */
export function summarizeSession(session: GameSession): KingdomSummary {
  const state = session.getState();
  return {
    score: session.getScore(),
    segments: session.getCampaignSegments(),
    finished: state.phase === Phase.GAME_OVER,
    round: state.round,
    turn: state.turn,
  };
}
