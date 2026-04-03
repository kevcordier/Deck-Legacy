import { TargetScope, type CardTag } from '@engine/domain/enums';
import type { CardDef, CardeSelector, GameState } from '@engine/domain/types';

/**
 * Filters cards matching the selector's constraints (scope, tags, produces, ids).
 */
export function cardSelector(
  selector: CardeSelector,
  instanceId: number,
  gameState: GameState,
  defs?: Record<number, CardDef>,
): number[] {
  const { tags, produces, ids, scope } = selector;
  if (scope === TargetScope.SELF) return [gameState.instances[instanceId].id];

  if (scope === TargetScope.TOP_OF_DECK) {
    const topCardId = gameState.drawPile[gameState.drawPile.length - 1];
    return topCardId ? [gameState.instances[topCardId].id] : [];
  }

  let pool: number[] = [];
  if (scope === TargetScope.DECK) {
    pool = gameState.drawPile;
  } else if (scope === TargetScope.BOARD) {
    pool = gameState.board;
  } else if (scope === TargetScope.DISCARD) {
    pool = gameState.discardPile;
  } else if (scope === TargetScope.BLOCKED) {
    pool = Object.values(gameState.blockingCards);
  } else if (scope === TargetScope.PERMANENTS) {
    pool = Object.values(gameState.permanents);
  } else {
    pool = Object.values(gameState.instances).map(inst => inst.id);
  }

  return pool.filter(id => {
    if (id === instanceId) return false; // Exclude self unless explicitly included by scope or ids
    if (scope !== TargetScope.BLOCKED && Object.values(gameState.blockingCards).includes(id))
      return false; // Exclude blocked cards
    const inst = gameState.instances[id];
    if (!inst || !defs) return false;
    const state = defs[inst.cardId]?.states.find(s => s.id === inst.stateId);

    return (
      (scope !== TargetScope.FRIENDLY || !state?.negative) &&
      (scope !== TargetScope.ENEMY || state?.negative) &&
      (!tags ||
        (tags.length > 0 &&
          state?.tags &&
          tags.every(tag => state.tags?.includes(tag as CardTag)))) &&
      (!produces ||
        (produces.length > 0 &&
          state?.productions &&
          state.productions.length > 0 &&
          produces.some(r => state.productions?.some(prod => Object.keys(prod).includes(r))))) &&
      (!ids || ids.length === 0 || ids.includes(id))
    );
  });
}
