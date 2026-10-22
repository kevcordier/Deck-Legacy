import type { CardDef, GameState, Sticker, ValuePerElement } from '../../types';
import { cardSelector } from './cardSelector';
import { getActiveState } from './getActiveState';
import { getEffectiveGlory } from './getEffectiveGlory';
import { getTotalProduction } from './getTotalProduction';
import { getTotalResourceProduction } from './getTotalResourceProduction';

function getCardGlory(
  id: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): number {
  const instance = gameState.instances[id];
  return getEffectiveGlory(getActiveState(instance, defs), gameState, defs, instance, stickerDefs);
}

/** The boxes marked on the current state's track of the card. */
function countMarkedSteps(
  gameState: GameState,
  instanceId: number,
  defs: Record<number, CardDef>,
): number {
  const instance = gameState.instances[instanceId];
  const steps = getActiveState(instance, defs).track?.steps ?? [];
  return steps.filter(step => instance.trackProgress.includes(step.id)).length;
}

/** The count of the selected cards: their glory, their production of a resource, or their number. */
function countSelectedCards(
  valuePerElement: ValuePerElement,
  ids: number[],
  gameState: GameState,
  instanceId: number,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): number {
  const { productionTotal } = valuePerElement;
  if (valuePerElement.glory) {
    return ids.reduce((sum, id) => sum + getCardGlory(id, gameState, defs, stickerDefs), 0);
  }
  if (productionTotal) {
    // The total production of that resource on the selected cards
    return ids.reduce(
      (sum, id) =>
        sum + getTotalResourceProduction(id, productionTotal, gameState, defs, stickerDefs),
      0,
    );
  }
  const self = valuePerElement.includeSelf && !ids.includes(instanceId) ? 1 : 0;
  return ids.length + self;
}

/** The count before `plus`, `deficitTarget` and `per`. */
function countElements(
  valuePerElement: ValuePerElement,
  gameState: GameState,
  instanceId: number,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  lastSelectedIds?: number[],
): number {
  if (valuePerElement.markedSteps) return countMarkedSteps(gameState, instanceId, defs);
  if (valuePerElement.cards) {
    const ids = cardSelector(
      { ...valuePerElement.cards, lastSelectedIds },
      instanceId,
      gameState,
      defs,
      stickerDefs,
    );
    return countSelectedCards(valuePerElement, ids, gameState, instanceId, defs, stickerDefs);
  }
  if (valuePerElement.accumulation && gameState.instances[instanceId].cumulated >= 1) {
    return gameState.instances[instanceId].cumulated;
  }
  if (valuePerElement.ownProduction) {
    return getTotalProduction(instanceId, gameState, defs, stickerDefs);
  }
  if (valuePerElement.productionTotal) {
    const prodKey = valuePerElement.productionTotal;
    return getTotalResourceProduction(instanceId, prodKey, gameState, defs, stickerDefs);
  }
  return 0;
}

export function countValuePerElement(
  valuePerElement: ValuePerElement,
  gameState: GameState,
  instanceId: number,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  lastSelectedIds?: number[],
): number {
  const count = Math.min(
    countElements(valuePerElement, gameState, instanceId, defs, stickerDefs, lastSelectedIds) +
      (valuePerElement.plus ?? 0),
    valuePerElement.max ?? Infinity,
  );

  if (valuePerElement.deficitTarget !== undefined) {
    return Math.max(0, valuePerElement.deficitTarget - count);
  }
  return valuePerElement.per ? Math.floor(count / valuePerElement.per) : count;
}
