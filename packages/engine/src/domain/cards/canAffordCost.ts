import { fixResources } from '../resources/fixResources';
import { getPayableResourceCostVariants } from '../resources/getPayableResourceCostVariants';
import { getSourceResourceEquivalence } from '../resources/getSourceResourceEquivalence';
import type { CardDef, Cost, GameState, Sticker } from '../types';
import { canAffordResources } from './canAffordResources';
import { getSpendableResources } from './getSpendableResources';
import { cardSelector } from './selection/cardSelector';

/** Vérifie si les cartes requises pour un coût discard/destroy existent dans la sélection. */
export function canAffordCost(
  cost: Cost | undefined,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  equivalenceSourceInstanceId = instanceId,
): boolean {
  if (cost?.resources) {
    const available = getSpendableResources(gameState, cost.forUpgrade);
    const equivalence = getSourceResourceEquivalence(
      equivalenceSourceInstanceId,
      gameState,
      defs,
      stickerDefs,
    );

    const canAffordResourceCostOption = equivalence
      ? cost.resources.some(
          resourceCost =>
            getPayableResourceCostVariants(fixResources(resourceCost), available, equivalence)
              .length > 0,
        )
      : canAffordResources(
          available,
          cost.resources.map(r => fixResources(r)),
        );

    if (!canAffordResourceCostOption) return false;
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
