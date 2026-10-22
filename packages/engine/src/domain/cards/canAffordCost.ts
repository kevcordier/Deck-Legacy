import { countResources } from '../resources/countResources';
import { fixResources } from '../resources/fixResources';
import { getDiscountedPayment } from '../resources/getDiscountedPayment';
import { getPayableResourceCostVariants } from '../resources/getPayableResourceCostVariants';
import { getSourceResourceEquivalence } from '../resources/getSourceResourceEquivalence';
import type { CardDef, Cost, GameState, Sticker } from '../types';
import { canAffordResources } from './canAffordResources';
import { getSpendableResources } from './getSpendableResources';
import { cardSelector } from './selection/cardSelector';

/** The resources of a cost: a discount (Crane), equivalences, or the plain options. */
function canAffordResourceCost(
  cost: Cost,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  equivalenceSourceInstanceId: number,
): boolean {
  const resources = cost.resources ?? [];
  const available = getSpendableResources(gameState, cost.forUpgrade);
  if (cost.discount) {
    const { payable, total } = getDiscountedPayment(
      fixResources(resources[0] ?? {}),
      available,
      cost.discount,
    );
    return countResources(payable) >= total;
  }
  const equivalence = getSourceResourceEquivalence(
    equivalenceSourceInstanceId,
    gameState,
    defs,
    stickerDefs,
  );
  if (!equivalence)
    return canAffordResources(
      available,
      resources.map(r => fixResources(r)),
    );
  return resources.some(
    resourceCost =>
      getPayableResourceCostVariants(fixResources(resourceCost), available, equivalence).length > 0,
  );
}

/** Vérifie si les cartes requises pour un coût discard/destroy existent dans la sélection. */
export function canAffordCost(
  cost: Cost | undefined,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  equivalenceSourceInstanceId = instanceId,
): boolean {
  if (
    cost?.resources &&
    !canAffordResourceCost(cost, gameState, defs, stickerDefs, equivalenceSourceInstanceId)
  ) {
    return false;
  }

  if (
    cost?.anyResources &&
    countResources(getSpendableResources(gameState, cost.forUpgrade)) < cost.anyResources
  ) {
    return false;
  }

  if (cost?.accumulated && (gameState.instances[instanceId]?.cumulated ?? 0) < cost.accumulated) {
    return false;
  }

  if (
    cost?.discard?.length &&
    cost.discard.some(discardCost => {
      const candidates = cardSelector(discardCost, instanceId, gameState, defs, stickerDefs).filter(
        id => gameState.board.includes(id),
      );
      return candidates.length < (discardCost.pickNumber ?? 1);
    })
  ) {
    return false;
  }

  if (cost?.destroy) {
    const available = cardSelector(cost.destroy, instanceId, gameState, defs, stickerDefs);
    if (available.length < (cost.destroy.pickNumber ?? 1)) return false;
  }
  return true;
}
