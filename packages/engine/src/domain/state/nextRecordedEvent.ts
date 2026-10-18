import type { GameEvent } from '../types';

export function nextRecordedEvent(events: GameEvent[], from: number): number {
  let index = from;
  while (index < events.length && !events[index].commands) index += 1;
  return index;
}
