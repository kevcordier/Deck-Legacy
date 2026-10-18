import { GameEventType } from '@deck-legacy/engine/domain/enums';
import type {
  CardInstance,
  GameEvent,
  GameState,
  UpgradeCardEvent,
} from '@deck-legacy/engine/domain/types';

/** A card upgraded by the last player command, before and after its upgrade. */
export type UpgradeReveal = { readonly before: CardInstance; readonly after: CardInstance };

/** The last card upgraded by `newEvents`, as it was in `previous` and as it is in `next`. */
export function findUpgradeReveal(
  previous: GameState,
  next: GameState,
  newEvents: GameEvent[],
): UpgradeReveal | null {
  const upgrade = newEvents.findLast(
    (event): event is UpgradeCardEvent => event.type === GameEventType.UPGRADE_CARD,
  );
  if (!upgrade) return null;
  const before = previous.instances[upgrade.cardInstanceId];
  const after = next.instances[upgrade.cardInstanceId];
  return before && after ? { before, after } : null;
}
