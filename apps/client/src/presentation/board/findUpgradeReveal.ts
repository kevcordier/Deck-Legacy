import { GameEventType } from '@deck-legacy/engine/domain/enums';
import type {
  CardInstance,
  GameEvent,
  GameState,
  UpgradeCardEvent,
} from '@deck-legacy/engine/domain/types';

/** A card upgraded by the last player command, before and after its upgrade. */
export type UpgradeReveal = { readonly before: CardInstance; readonly after: CardInstance };

/** The last card whose state a card action changed (its event only holds the new state). */
function changedByAction(previous: GameState, next: GameState, newEvents: GameEvent[]) {
  if (!newEvents.some(event => event.type === GameEventType.CARD_ACTION)) return undefined;
  return Object.keys(next.instances)
    .map(Number)
    .findLast(id => {
      const before = previous.instances[id] as CardInstance | undefined;
      return before !== undefined && before.stateId !== next.instances[id].stateId;
    });
}

/**
 * The last card upgraded by `newEvents` (an upgrade, or a card action changing a card's state),
 * as it was in `previous` and as it is in `next`.
 */
export function findUpgradeReveal(
  previous: GameState,
  next: GameState,
  newEvents: GameEvent[],
): UpgradeReveal | null {
  const upgrade = newEvents.findLast(
    (event): event is UpgradeCardEvent => event.type === GameEventType.UPGRADE_CARD,
  );
  const instanceId = upgrade?.cardInstanceId ?? changedByAction(previous, next, newEvents);
  if (instanceId === undefined) return null;
  const before = previous.instances[instanceId];
  const after = next.instances[instanceId];
  return before && after ? { before, after } : null;
}
