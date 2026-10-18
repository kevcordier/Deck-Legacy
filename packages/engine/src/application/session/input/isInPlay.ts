import type { GameState } from '../../../domain/types';

export function isInPlay(state: GameState, instanceId: number): boolean {
  return state.board.includes(instanceId) || state.permanents.includes(instanceId);
}
