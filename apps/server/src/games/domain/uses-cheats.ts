import { GameEventType } from '@deck-legacy/engine/domain/enums';
import type { CardActionEvent, GameEvent } from '@deck-legacy/engine/domain/types';

/**
 * Events produced by the development cheat panel (`GameSession` cheat commands): tagged
 * `cheat`, or, before the tag existed, card actions named `cheat_…`.
 */
export function usesCheats(events: GameEvent[]): boolean {
  return events.some(
    event =>
      event.cheat === true ||
      (event.type === GameEventType.CARD_ACTION &&
        (event as CardActionEvent).actionId.startsWith('cheat_')),
  );
}
