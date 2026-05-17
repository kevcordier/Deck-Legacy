import { cardSelector } from '@engine/application/cardSelector';
import { getPickNumbers } from '@engine/application/effectResolver';
import {
  dedupeResourceOptions,
  getPayableResourceCostVariants,
  getSourceResourceEquivalence,
} from '@engine/application/resourceEquivalence';
import { ActionEffectType, PendingChoiceType, TargetScope } from '@engine/domain/enums';
import { CostResolutionError } from '@engine/domain/errors/CostResolutionError';
import type {
  CardDef,
  Cost,
  GameState,
  PendingChoice,
  ResolvedCost,
  Resources,
  Sticker,
} from '@engine/domain/types';

function canAffordResourceCost(
  availableResources: GameState['resources'],
  resourceCost: ResolvedCost['resources'],
): boolean {
  return Object.entries(resourceCost).every(
    ([resource, amount]) =>
      (availableResources[resource as keyof typeof availableResources] ?? 0) >= amount,
  );
}

function getPayableResourceCosts(
  cost: Cost,
  equivalenceSourceInstanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): Resources[] {
  if (!cost.resources) return [];

  const equivalence = getSourceResourceEquivalence(
    equivalenceSourceInstanceId,
    gameState,
    defs,
    stickerDefs,
  );

  if (!equivalence) {
    return cost.resources.filter(resourceCost =>
      canAffordResourceCost(gameState.resources, resourceCost),
    );
  }

  return dedupeResourceOptions(
    cost.resources.flatMap(resourceCost =>
      getPayableResourceCostVariants(resourceCost, gameState.resources, equivalence),
    ),
  );
}

export function resolveCost(
  cost: Cost,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  isMandatory = false,
  equivalenceSourceInstanceId = instanceId,
): [ResolvedCost, PendingChoice[]] {
  const pendingChoices: PendingChoice[] = [];
  const resolvedCost: ResolvedCost = {
    resources: {},
    discardedCardIds: [],
    destroyedCardIds: [],
  };

  if (cost.resources) {
    const payableResourceCosts = getPayableResourceCosts(
      cost,
      equivalenceSourceInstanceId,
      gameState,
      defs,
      stickerDefs,
    );

    if (payableResourceCosts.length === 0) {
      throw new CostResolutionError('errors.cost.notEnoughResources');
    }

    if (payableResourceCosts.length === 1) {
      resolvedCost.resources = payableResourceCosts[0];
    } else {
      pendingChoices.push({
        id: `${instanceId}-cost`,
        kind: ActionEffectType.COST,
        type: PendingChoiceType.CHOOSE_RESOURCE,
        sourceInstanceId: instanceId,
        choices: payableResourceCosts,
        pickMax: 1,
        pickMin: 1,
        isMandatory,
      });
    }
  }

  if (cost.discard?.length) {
    cost.discard.forEach((discardCost, index) => {
      const candidates = cardSelector(discardCost, instanceId, gameState, defs, stickerDefs).filter(
        id => gameState.board.includes(id),
      );
      const picks = getPickNumbers(discardCost);
      if (picks.pickMin && candidates.length < picks.pickMin) {
        throw new CostResolutionError('errors.cost.notEnoughCardsToDiscard');
      }
      if (
        candidates.length === 1 &&
        discardCost.scope?.length === 1 &&
        discardCost.scope[0] === TargetScope.SELF
      ) {
        resolvedCost.discardedCardIds = candidates;
      } else {
        pendingChoices.push({
          id: `${instanceId}-discard-${index}`,
          kind: ActionEffectType.COST,
          type: PendingChoiceType.CHOOSE_CARD,
          sourceInstanceId: instanceId,
          choices: candidates,
          ...picks,
          isMandatory,
        });
      }
    });
  }

  if (cost.destroy) {
    const candidates = cardSelector(cost.destroy, instanceId, gameState, defs, stickerDefs).filter(
      id => gameState.board.includes(id),
    );
    const picks = getPickNumbers(cost.destroy);
    if (picks.pickMin && candidates.length < picks.pickMin) {
      throw new CostResolutionError('errors.cost.notEnoughCardsToDestroy');
    }
    if (
      candidates.length === 1 &&
      cost.destroy.scope?.length === 1 &&
      cost.destroy.scope[0] === TargetScope.SELF
    ) {
      resolvedCost.destroyedCardIds = candidates;
    } else {
      pendingChoices.push({
        id: `${instanceId}-destroy`,
        kind: ActionEffectType.COST,
        type: PendingChoiceType.CHOOSE_CARD,
        sourceInstanceId: instanceId,
        choices: candidates,
        ...picks,
        isMandatory,
      });
    }
  }

  return [resolvedCost, pendingChoices];
}
