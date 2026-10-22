import { Phase } from '../../../domain/enums';
import type { GameCommand, GameState } from '../../../domain/types';

/**
 * Checks of the player input (EDR-051). The server runs the recorded commands again, so a
 * command the engine accepts is a legal move: these checks refuse what the UI never sends.
 */

/** Phases in which the UI offers each turn flow command (`GamePhaseActions`). */
export function isFlowCommandAllowed(
  command: GameCommand,
  state: GameState,
  lastRound: boolean,
): boolean {
  switch (command.type) {
    case 'startRound':
      return state.phase === Phase.ROUND_END && !lastRound;
    case 'endRound':
      return (
        (state.phase === Phase.TURN_END && state.drawPile.length === 0) ||
        (state.phase === Phase.ROUND_END && lastRound)
      );
    case 'startTurn':
      // "Start of round" effects resolve before the first turn (Haunted Souls).
      return (
        (state.phase === Phase.ROUND_START && Object.keys(state.triggerPile).length === 0) ||
        state.phase === Phase.TURN_END
      );
    case 'progress':
    case 'endTurn':
      return state.phase === Phase.PLAYING;
    case 'selectExpansion':
      return state.phase === Phase.EXPANSION_CHOICE;
    default:
      return true;
  }
}
