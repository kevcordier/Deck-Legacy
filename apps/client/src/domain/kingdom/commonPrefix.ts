import type { GameEvent } from '@deck-legacy/engine/domain/types';

/** Number of leading events two logs share (compared by id, as the server does). */
export function commonPrefix(a: GameEvent[], b: GameEvent[]): number {
  let index = 0;
  while (index < a.length && index < b.length && a[index].id === b[index].id) index += 1;
  return index;
}
