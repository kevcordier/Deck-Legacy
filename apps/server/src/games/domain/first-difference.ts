import type { GameEvent } from '@deck-legacy/engine/domain/types';

/** Index of the first event that differs between the stored and the incoming log. */
export function firstDifference(storedIds: string[], events: GameEvent[]): number {
  let index = 0;
  while (
    index < storedIds.length &&
    index < events.length &&
    storedIds[index] === events[index].id
  ) {
    index += 1;
  }
  return index;
}
