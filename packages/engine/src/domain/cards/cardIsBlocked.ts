import { PassiveType } from '../enums';
import type { GameState } from '../types';
import { getAffectedCardsByBoardEffects } from './selection/getAffectedCardsByBoardEffects';

export function cardIsBlocked(instanceId: number, gameState: GameState): boolean {
  return Object.values(getAffectedCardsByBoardEffects(gameState, PassiveType.BLOCK))
    .flat()
    .includes(instanceId);
}
