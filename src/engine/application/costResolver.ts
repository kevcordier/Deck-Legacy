import { cardSelector } from '@engine/application/cardSelector';
import { ActionEffectType, PendingChoiceType } from '@engine/domain/enums';
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
        pickCount: 1,
        isMandatory,
      });
    }
  }

  if (cost.discard?.length) {
    cost.discard.forEach((discardCost, index) => {
      const candidates = cardSelector(discardCost, instanceId, gameState, defs, stickerDefs).filter(
        id => gameState.board.includes(id),
      );
      const requiredCount = discardCost.pickNumber ?? 1;
      if (candidates.length < requiredCount) {
        throw new CostResolutionError('Not enough cards available to pay this discard cost.');
      }
      if (candidates.length === requiredCount) {
        resolvedCost.discardedCardIds.push(...candidates);
      } else {
        pendingChoices.push({
          id: `${instanceId}-discard-${index}`,
          kind: ActionEffectType.COST,
          type: PendingChoiceType.CHOOSE_CARD,
          sourceInstanceId: instanceId,
          choices: candidates,
          pickCount: requiredCount,
          isMandatory,
        });
      }
    });
  }

  if (cost.destroy) {
    const candidates = cardSelector(cost.destroy, instanceId, gameState, defs, stickerDefs).filter(
      id => gameState.board.includes(id),
    );
    const requiredCount = cost.destroy.pickNumber ?? 1;
    if (candidates.length < requiredCount) {
      throw new CostResolutionError('Not enough cards available to pay this destroy cost.');
    }
    if (candidates.length === requiredCount) {
      resolvedCost.destroyedCardIds = candidates;
    } else {
      pendingChoices.push({
        id: `${instanceId}-destroy`,
        kind: ActionEffectType.COST,
        type: PendingChoiceType.CHOOSE_CARD,
        sourceInstanceId: instanceId,
        choices: candidates,
        pickCount: requiredCount,
        isMandatory,
      });
    }
  }

  return [resolvedCost, pendingChoices];
}
