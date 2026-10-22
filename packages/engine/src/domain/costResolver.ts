import { getSpendableResources } from './cards/getSpendableResources';
import { cardSelector } from './cards/selection/cardSelector';
import { getPickNumbers } from './effects/getPickNumbers';
import { ActionEffectType, PendingChoiceType, TargetScope } from './enums';
import { CostResolutionError } from './errors/CostResolutionError';
import { countResources } from './resources/countResources';
import { dedupeResourceOptions } from './resources/dedupeResourceOptions';
import { fixResources } from './resources/fixResources';
import { getDiscountedPayment } from './resources/getDiscountedPayment';
import { getPayableResourceCostVariants } from './resources/getPayableResourceCostVariants';
import { getSourceResourceEquivalence } from './resources/getSourceResourceEquivalence';
import type {
  CardDef,
  Cost,
  GameState,
  PendingChoice,
  ResolvedCost,
  Resources,
  Sticker,
} from './types';

function canAffordResourceCost(
  availableResources: GameState['resources'],
  resourceCost: ResolvedCost['resources'],
): boolean {
  return Object.entries(resourceCost).every(
    ([resource, amount]) =>
      (availableResources[resource as keyof typeof availableResources] ?? 0) >= amount,
  );
}

/** The resource cost to pay: the only payable one, or a choice among them (`null` = the only). */
function resourceCostChoice(
  payable: Resources[],
  instanceId: number,
  isMandatory: boolean,
): PendingChoice | null {
  if (payable.length === 0) throw new CostResolutionError('errors.cost.notEnoughResources');
  if (payable.length === 1) return null;
  return {
    id: `${instanceId}-cost`,
    kind: ActionEffectType.COST,
    type: PendingChoiceType.CHOOSE_RESOURCE,
    sourceInstanceId: instanceId,
    choices: payable,
    pickMax: 1,
    pickMin: 1,
    isMandatory,
  };
}

/** The resources the player has (positive amounts only). */
function sanitizeAvailable(resources: Resources): Resources {
  return Object.fromEntries(Object.entries(resources).filter(([, value]) => (value ?? 0) > 0));
}

/** "Spend N resources of any types" (Cursed Lands): the player splits the total. */
function splitResourcesChoice(
  total: number,
  instanceId: number,
  gameState: GameState,
  isMandatory: boolean,
  forUpgrade?: boolean,
): PendingChoice {
  const available = sanitizeAvailable(getSpendableResources(gameState, forUpgrade));
  if (countResources(available) < total) {
    throw new CostResolutionError('errors.cost.notEnoughResources');
  }
  return {
    id: `${instanceId}-cost-split`,
    kind: ActionEffectType.COST,
    type: PendingChoiceType.SPLIT_RESOURCES,
    sourceInstanceId: instanceId,
    choices: [available],
    total,
    pickMax: 1,
    pickMin: 1,
    isMandatory,
  };
}

/** A discounted cost (Crane): the player picks the units they pay; none when it is free. */
function discountedChoice(
  cost: Cost,
  instanceId: number,
  gameState: GameState,
  isMandatory: boolean,
): PendingChoice | null {
  const owned = sanitizeAvailable(getSpendableResources(gameState, cost.forUpgrade));
  const { payable, total } = getDiscountedPayment(
    fixResources(cost.resources?.[0] ?? {}),
    owned,
    cost.discount ?? 0,
  );
  if (total === 0) return null;
  if (countResources(payable) < total) {
    throw new CostResolutionError('errors.cost.notEnoughResources');
  }
  return {
    id: `${instanceId}-cost-split`,
    kind: ActionEffectType.COST,
    type: PendingChoiceType.SPLIT_RESOURCES,
    sourceInstanceId: instanceId,
    choices: [payable],
    total,
    pickMax: 1,
    pickMin: 1,
    isMandatory,
  };
}

function getPayableResourceCosts(
  cost: Cost,
  equivalenceSourceInstanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): Resources[] {
  if (!cost.resources) return [];
  const available = getSpendableResources(gameState, cost.forUpgrade);

  const equivalence = getSourceResourceEquivalence(
    equivalenceSourceInstanceId,
    gameState,
    defs,
    stickerDefs,
  );

  if (!equivalence) {
    return cost.resources
      .map(resourceCost => fixResources(resourceCost))
      .filter(resourceCost => canAffordResourceCost(available, resourceCost));
  }

  return dedupeResourceOptions(
    cost.resources.flatMap(resourceCost =>
      getPayableResourceCostVariants(fixResources(resourceCost), available, equivalence),
    ),
  );
}

/** The resources of a cost: paid at once, or a choice (options, a discounted split). */
function resourcesChoice(
  cost: Cost,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  isMandatory: boolean,
  equivalenceSourceInstanceId: number,
): { pending?: PendingChoice; resources: Resources } {
  if (cost.discount) {
    const pending = discountedChoice(cost, instanceId, gameState, isMandatory);
    return { ...(pending && { pending }), resources: {} };
  }
  const payable = getPayableResourceCosts(
    cost,
    equivalenceSourceInstanceId,
    gameState,
    defs,
    stickerDefs,
  );
  const pending = resourceCostChoice(payable, instanceId, isMandatory);
  return pending ? { pending, resources: {} } : { resources: payable[0] };
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
    const choice = resourcesChoice(
      cost,
      instanceId,
      gameState,
      defs,
      stickerDefs,
      isMandatory,
      equivalenceSourceInstanceId,
    );
    if (choice.pending) pendingChoices.push(choice.pending);
    else resolvedCost.resources = choice.resources;
  }

  if (cost.anyResources) {
    pendingChoices.push(
      splitResourcesChoice(cost.anyResources, instanceId, gameState, isMandatory, cost.forUpgrade),
    );
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
