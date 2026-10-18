import { GameEventType } from '../enums';
import type { GameEvent, TurnStartedEvent } from '../types';
import { nextRecordedEvent } from './nextRecordedEvent';

/**
 * Where the server may keep a checkpoint (EDR-052): after the commands that drew the first turn of
 * the last round (a normal rewind never goes back past a draw), when later commands follow them.
 * Returns 0 when there is no such point yet.
 */
export function checkpointSeq(events: GameEvent[]): number {
  const firstTurn = events.findLastIndex(
    event => event.type === GameEventType.TURN_STARTED && (event as TurnStartedEvent).turn === 1,
  );
  if (firstTurn < 0) return 0;
  const seq = nextRecordedEvent(events, firstTurn + 1);
  return seq < events.length ? seq : 0;
}
