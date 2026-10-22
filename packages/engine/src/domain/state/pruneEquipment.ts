import type { GameState } from '../types';

/** Keeps the equipment links whose equipment and holder are both still in play. */
export function pruneEquipment(gameState: GameState): GameState {
  const links = gameState.equipped;
  if (!links) return gameState;
  const inPlay = (id: number) => gameState.board.includes(id) || gameState.permanents.includes(id);
  const kept = Object.entries(links).filter(
    ([equipment, holder]) => inPlay(Number(equipment)) && inPlay(holder),
  );
  if (kept.length === Object.keys(links).length) return gameState;
  return { ...gameState, equipped: Object.fromEntries(kept) };
}
