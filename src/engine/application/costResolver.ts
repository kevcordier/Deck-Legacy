import { cardSelector } from '@engine/application/cardSelector';
import { ActionType, PendingChoiceType } from '@engine/domain/enums';
import type { CardDef, Cost, GameState, PendingChoice, ResolvedCost } from '@engine/domain/types';

export function resolveCost(
  cost: Cost,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  isMandatory = false,
): [ResolvedCost, PendingChoice[]] {
  const pendingChoices: PendingChoice[] = [];
  const resolvedCost: ResolvedCost = {
    resources: {},
    discardedCardIds: [],
    destroyedCardIds: [],
  };

  if (cost.resources) {
    if (cost.resources.length === 1) {
      resolvedCost.resources = cost.resources[0];
    } else {
      pendingChoices.push({
        id: `${instanceId}-cost`,
        kind: ActionType.COST,
        type: PendingChoiceType.CHOOSE_RESOURCE,
        sourceInstanceId: instanceId,
        choices: cost.resources,
        pickCount: 1,
        isMandatory,
      });
    }
  }

  if (cost.discard) {
    const candidates = cardSelector(cost.discard, instanceId, gameState, defs).filter(id =>
      gameState.board.includes(id),
    );
    if (candidates.length === 0) {
      resolvedCost.discardedCardIds = [];
    } else if (candidates.length === (cost.discard.number || 1)) {
      resolvedCost.discardedCardIds = candidates;
    } else {
      pendingChoices.push({
        id: `${instanceId}-discard`,
        kind: ActionType.COST,
        type: PendingChoiceType.CHOOSE_CARD,
        sourceInstanceId: instanceId,
        choices: candidates,
        pickCount: cost.discard.number ?? 1,
        isMandatory,
      });
    }
  }

  if (cost.destroy) {
    const candidates = cardSelector(cost.destroy, instanceId, gameState, defs).filter(id =>
      gameState.board.includes(id),
    );
    if (candidates.length === 0) {
      resolvedCost.destroyedCardIds = [];
    } else if (candidates.length === (cost.destroy.number || 1)) {
      resolvedCost.destroyedCardIds = candidates;
    } else {
      pendingChoices.push({
        id: `${instanceId}-destroy`,
        kind: ActionType.COST,
        type: PendingChoiceType.CHOOSE_CARD,
        sourceInstanceId: instanceId,
        choices: candidates,
        pickCount: cost.destroy.number ?? 1,
        isMandatory,
      });
    }
  }

  return [resolvedCost, pendingChoices];
}
