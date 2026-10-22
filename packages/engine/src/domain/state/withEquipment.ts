import { getEquipment } from '../cards/selection/getEquipment';
import type { GameState } from '../types';

/**
 * The cards leaving play and the equipment of those that hold some; their links are removed.
 * Mutates the given copy of the state.
 */
export function withEquipment(gameState: GameState, cardIds: number[]): number[] {
  const leaving = [...new Set([...cardIds, ...cardIds.flatMap(id => getEquipment(gameState, id))])];
  if (gameState.equipped) {
    gameState.equipped = Object.fromEntries(
      Object.entries(gameState.equipped).filter(
        ([equipment, holder]) => !leaving.includes(Number(equipment)) && !leaving.includes(holder),
      ),
    );
  }
  return leaving;
}
