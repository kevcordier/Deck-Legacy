import { type Options, PassiveType } from '../enums';
import type { GameState } from '../types';

export function canUseOptions(gameState: GameState, options: Options): boolean {
  return !Object.values(gameState.boardEffects).some(effect =>
    effect.some(p => p.type === PassiveType.DESACTIVATE_OPTION && p.options?.includes(options)),
  );
}
