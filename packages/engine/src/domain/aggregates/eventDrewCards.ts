import { GameEventType } from '../enums';
import type { GameEvent, GameState } from '../types';

/** Events that revealed cards: a normal rewind cannot go back past them. */
export function eventDrewCards(event: GameEvent): boolean {
  if (event.type === GameEventType.TURN_STARTED || event.type === GameEventType.ADVANCE) {
    return true;
  }
  if (event.type !== GameEventType.CARD_ACTION) return false;
  const changes = (event as { gameStateChanges?: Partial<GameState> }).gameStateChanges;
  return !changes || Object.hasOwn(changes, 'drawPile');
}
