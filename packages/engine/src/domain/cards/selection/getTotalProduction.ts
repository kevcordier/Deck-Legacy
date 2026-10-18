import type { CardDef, GameState, Resources, Sticker } from '../../types';
import { getActiveState } from './getActiveState';
import { getEffectiveProductions } from './getEffectiveProductions';

export function getTotalProduction(
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): number {
  const instance = gameState.instances[instanceId];
  if (!instance) return 0;
  const state = getActiveState(instance, defs);
  const productions = (state.productions as Resources[]) ?? [{}];
  return productions.reduce((maxTotal, base) => {
    const effective = getEffectiveProductions(base, gameState, defs, instance, stickerDefs, false);
    const total = Object.values(effective).reduce<number>((sum, v) => sum + (v ?? 0), 0);
    return Math.max(maxTotal, total);
  }, 0);
}
