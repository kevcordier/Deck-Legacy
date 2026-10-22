import { PassiveType } from '../../enums';
import type { CardDef, GameState, Sticker } from '../../types';
import { getActiveState } from './getActiveState';
import { getEffectiveGlory } from './getEffectiveGlory';

/**
 * The glory of a purge: the purged cards and those saved with their glory kept (Countess). A purged
 * PURGE_MIN_GLORY card (Frostpeak) makes each of them worth at least its amount.
 */
export function getPurgeGlory(
  purgedIds: number[],
  keptGloryIds: number[],
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): number {
  const states = purgedIds
    .filter(id => gameState.instances[id])
    .map(id => getActiveState(gameState.instances[id], defs));
  const minimum = Math.max(
    -Infinity,
    ...states.flatMap(state =>
      (state.passives ?? [])
        .filter(passive => passive.type === PassiveType.PURGE_MIN_GLORY)
        .map(passive => passive.amount ?? 0),
    ),
  );
  return [...purgedIds, ...keptGloryIds].reduce((total, id) => {
    const instance = gameState.instances[id];
    if (!instance) return total;
    const state = getActiveState(instance, defs);
    const glory =
      state.glory?.whenPurged ?? getEffectiveGlory(state, gameState, defs, instance, stickerDefs);
    return total + Math.max(glory, minimum);
  }, 0);
}
