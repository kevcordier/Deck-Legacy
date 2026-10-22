import type { GameState } from '../../types';

/** The cards equipped to `holderId`. */
export function getEquipment(gameState: GameState, holderId: number): number[] {
  return Object.entries(gameState.equipped ?? {})
    .filter(([, holder]) => holder === holderId)
    .map(([equipment]) => Number(equipment));
}
