import type { CardDef, GameState, Sticker, ValuePerElement } from '../../types';
import { cardSelector } from './cardSelector';
import { getTotalProduction } from './getTotalProduction';
import { getTotalResourceProduction } from './getTotalResourceProduction';

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
    count = ids.length + (valuePerElement.includeSelf && !ids.includes(instanceId) ? 1 : 0);
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
