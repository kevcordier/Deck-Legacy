import { type Options, PassiveType } from '../enums';
import type { GameState } from '../types';

/** A card's own DESACTIVATE_OPTION never blocks it ("you may not use other {{time}} effects"). */
export function canUseOptions(
  gameState: GameState,
  options: Options,
  instanceId?: number,
): boolean {
  return !Object.entries(gameState.boardEffects).some(
    ([sourceId, effect]) =>
      Number(sourceId) !== instanceId &&
      effect.some(p => p.type === PassiveType.DESACTIVATE_OPTION && p.options?.includes(options)),
  );
}
