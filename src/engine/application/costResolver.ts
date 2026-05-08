import { cardSelector } from '@engine/application/cardSelector';
import { getPickNumbers } from '@engine/application/effectResolver';
import { ActionEffectType, PendingChoiceType, TargetScope } from '@engine/domain/enums';
import type {
  CardDef,
  Cost,
  GameState,
  PendingChoice,
  ResolvedCost,
  Sticker,
} from '@engine/domain/types';

export class CostResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CostResolutionError';
  }
}

function canAffordResourceCost(
  availableResources: GameState['resources'],
  resourceCost: ResolvedCost['resources'],
): boolean {
  return Object.entries(resourceCost).every(
    ([resource, amount]) =>
      (availableResources[resource as keyof typeof availableResources] ?? 0) >= amount,
  );
}

export function resolveCost(
  cost: Cost,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  isMandatory = false,
): [ResolvedCost, PendingChoice[]] {
  const pendingChoices: PendingChoice[] = [];
  const resolvedCost: ResolvedCost = {
    resources: {},
    discardedCardIds: [],
    destroyedCardIds: [],
  };

  if (cost.resources) {
    const payableResourceCosts = cost.resources.filter(resourceCost =>
      canAffordResourceCost(gameState.resources, resourceCost),
    );

    if (payableResourceCosts.length === 0) {
      throw new CostResolutionError('Not enough resources to pay this cost.');
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
        throw new CostResolutionError('Not enough cards available to pay this discard cost.');
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
      throw new CostResolutionError('Not enough cards available to pay this destroy cost.');
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
