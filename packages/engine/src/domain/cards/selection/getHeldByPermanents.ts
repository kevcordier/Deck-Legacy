import { PassiveType } from '../../enums';
import type { GameState } from '../../types';
import { getAffectedCardsByBoardEffects } from './getAffectedCardsByBoardEffects';

/**
 * Cards blocked by a permanent (Quarantine): they stay blocked across turns and rounds, out of
 * the deck, until released (EDR-059).
 */
export function getHeldByPermanents(gameState: GameState): number[] {
  return Object.entries(getAffectedCardsByBoardEffects(gameState, PassiveType.BLOCK))
    .filter(([sourceId]) => gameState.permanents.includes(Number(sourceId)))
    .flatMap(([, ids]) => ids)
    .filter(id => gameState.board.includes(id));
}
