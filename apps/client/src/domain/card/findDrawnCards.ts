import type { GameState } from '@deck-legacy/engine/domain/types';

/** Cards that left the draw pile for the board (or the permanents) between two states. */
export function findDrawnCards(previous: GameState, next: GameState): number[] {
  const inPlay = new Set([...next.board, ...next.permanents]);
  return previous.drawPile.filter(id => inPlay.has(id));
}
