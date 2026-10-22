import type { CardDef, CardInstance, GameState, Resources, Sticker } from '../types';
import { getProductionChoicesForAction } from './getProductionChoicesForAction';
import { getActiveState } from './selection/getActiveState';

/**
 * What a card produces, as when it produces itself: stickers, passives and replacements included,
 * also for a card without printed production. Only the choices that gain something.
 */
export function getCardProductionChoices(
  instance: CardInstance,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): Resources[] {
  const state = getActiveState(instance, defs);
  // An equipment never produces itself: its holder does, once it is equipped
  if (state.equip) return [];
  const bases = state.productions ?? [{}];
  const unique = new Map<string, Resources>();
  for (const base of bases) {
    for (const choice of getProductionChoicesForAction(
      base,
      gameState,
      defs,
      instance,
      stickerDefs,
    )) {
      if (Object.values(choice).some(value => (value ?? 0) > 0)) {
        unique.set(JSON.stringify(choice), choice);
      }
    }
  }
  return [...unique.values()];
}
