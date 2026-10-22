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

export function countValuePerElement(
  valuePerElement: ValuePerElement,
  gameState: GameState,
  instanceId: number,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  lastSelectedIds?: number[],
): number {
  let count = 0;
  if (valuePerElement.cards) {
    const ids = cardSelector(
      { ...valuePerElement.cards, lastSelectedIds },
      instanceId,
      gameState,
      defs,
      stickerDefs,
    );
    const { productionTotal } = valuePerElement;
    if (valuePerElement.glory) {
      count = ids.reduce((sum, id) => sum + getCardGlory(id, gameState, defs, stickerDefs), 0);
    } else if (productionTotal) {
      // The total production of that resource on the selected cards
      count = ids.reduce(
        (sum, id) =>
          sum + getTotalResourceProduction(id, productionTotal, gameState, defs, stickerDefs),
        0,
      );
    } else {
      const self = valuePerElement.includeSelf && !ids.includes(instanceId) ? 1 : 0;
      count = ids.length + self;
    }
  } else if (valuePerElement.accumulation && gameState.instances[instanceId].cumulated >= 1) {
    count = gameState.instances[instanceId].cumulated;
  } else if (valuePerElement.ownProduction) {
    count = getTotalProduction(instanceId, gameState, defs, stickerDefs);
  } else if (valuePerElement.productionTotal) {
    const prodKey = valuePerElement.productionTotal;
    count = getTotalResourceProduction(instanceId, prodKey, gameState, defs, stickerDefs);
  }

  if (valuePerElement.deficitTarget !== undefined) {
    return Math.max(0, valuePerElement.deficitTarget - count);
  }
  return valuePerElement.per ? Math.floor(count / valuePerElement.per) : count;
}
