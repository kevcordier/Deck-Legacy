import {
  canAffordResources,
  getActiveState,
  getTotalResourceProduction,
} from '@engine/application/cardHelpers';
import { cardSelector } from '@engine/application/cardSelector';
import {
  ActionEffectType,
  PendingChoiceType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type {
  ActionEffect,
  CardDef,
  CardeSelector,
  GameState,
  PendingChoice,
  ResolvedActionEffect,
  ResourceSelector,
  Resources,
  Sticker,
  ValuePerElement,
} from '@engine/domain/types';

interface ResolveContext {
  actionId: number;
  actionType: ActionEffectType;
  instanceId: number;
  pickNumber?: number;
  pickMin?: number;
  pickMax?: number;
  isMandatory: boolean;
  gameState: GameState;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
}

function getPickCount(ctx: ResolveContext): number {
  return ctx.pickNumber ?? 1;
}

function getPickBounds(ctx: ResolveContext): { pickMin: number; pickMax: number } {
  const pickCount = getPickCount(ctx);
  return {
    pickMin: ctx.pickMin ?? pickCount,
    pickMax: ctx.pickMax ?? pickCount,
  };
}

function resolveTrackAdvanceEffect(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  cards: CardeSelector,
): [ResolvedActionEffect, PendingChoice[]] {
  const { actionId, actionType, instanceId, isMandatory, gameState, defs, stickerDefs } = ctx;

  const targetIds = cardSelector(cards, instanceId, gameState, defs, stickerDefs);
  if (targetIds.length === 0) return [resolverAction, pendingChoices];

  const targetId = targetIds[0];
  const targetInst = gameState.instances[targetId];
  const targetState = getActiveState(targetInst, defs);
  const track = targetState.track;
  if (!track) return [resolverAction, pendingChoices];

  const availableSteps = track.steps.filter(s => !targetInst.trackProgress.includes(s.id));
  if (availableSteps.length === 0) return [resolverAction, pendingChoices];

  resolverAction.instanceIds = [targetId];

  if (track.inOrder) {
    const sortedSteps = [...availableSteps].sort((a, b) => a.id - b.id);
    resolverAction.stepIds = [sortedSteps[0].id];
    resolverAction.newActionEffects =
      track.steps.find(s => s.id === resolverAction.stepIds?.[0])?.effects ?? [];
    return [resolverAction, pendingChoices];
  } else {
    const { pickMin, pickMax } = getPickBounds(ctx);
    const choices = availableSteps
      .filter(
        s =>
          !targetInst.trackProgress.includes(s.id) &&
          canAffordResources(gameState.resources, s.cost) &&
          (!s.cost?.accumulated || gameState.instances[instanceId].cumulated >= s.cost.accumulated),
      )
      .map(s => s.id);
    pendingChoices.push({
      id: `${instanceId}-${actionId}`,
      kind: actionType,
      type: PendingChoiceType.CHOOSE_STEP,
      sourceInstanceId: instanceId,
      targetInstanceId: targetId,
      choices,
      pickCount: getPickCount(ctx),
      pickMin,
      pickMax,
      isMandatory,
    });
  }

  return [resolverAction, pendingChoices];
}

export function countValuePerElement(
  valuePerElement: ValuePerElement,
  gameState: GameState,
  instanceId: number,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): number {
  let count = 0;
  if (valuePerElement.cards) {
    count = cardSelector(valuePerElement.cards, instanceId, gameState, defs, stickerDefs).length;
  } else if (valuePerElement.accumulation) {
    count = gameState.instances[instanceId].cumulated ?? 0;
  } else if (valuePerElement.productionTotal) {
    const prodKey = valuePerElement.productionTotal;
    count = getTotalResourceProduction(instanceId, prodKey, gameState, defs, stickerDefs);
  }

  if (valuePerElement.deficitTarget !== undefined) {
    return Math.max(0, valuePerElement.deficitTarget - count);
  }
  return count;
}

function resolveChooseActionEffect(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  effects: ActionEffect[],
): [ResolvedActionEffect, PendingChoice[]] {
  const { instanceId, actionId, actionType } = ctx;
  const choiceId = `${instanceId}-${actionId}`;
  pendingChoices.push({
    id: choiceId,
    kind: actionType,
    type: PendingChoiceType.CHOOSE_ACTION_EFFECT,
    sourceInstanceId: instanceId,
    choices: effects,
    pickCount: 1,
    isMandatory: true,
  });
  return [resolverAction, pendingChoices];
}

function resolveValuePerElement(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  valuePerElement: ValuePerElement,
): [ResolvedActionEffect, PendingChoice[]] {
  const { gameState, instanceId, defs, actionId, actionType, isMandatory, stickerDefs } = ctx;

  const number = countValuePerElement(valuePerElement, gameState, instanceId, defs, stickerDefs);

  if (number === 0) {
    return [resolverAction, pendingChoices];
  }

  if (valuePerElement.resource?.length === 1) {
    resolverAction.resources = {
      [valuePerElement.resource[0]]: number * valuePerElement.amount,
    };
  }
  if (valuePerElement.resource && valuePerElement.resource.length > 1) {
    Array.from({ length: number }).forEach(() => {
      pendingChoices.push({
        // Keep the same id as the resolved action so each pick merges into it.
        id: `${instanceId}-${actionId}`,
        kind: actionType,
        type: PendingChoiceType.CHOOSE_RESOURCE,
        sourceInstanceId: instanceId,
        choices: valuePerElement.resource?.map(r => ({ [r]: 1 })) as Resources[],
        pickCount: 1,
        isMandatory,
      });
    });
  }

  return [resolverAction, pendingChoices];
}

function resolveCardTarget(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  cards: CardeSelector,
): [ResolvedActionEffect, PendingChoice[]] {
  const { actionId, actionType, instanceId, isMandatory, gameState, defs, stickerDefs } = ctx;

  if (cards.ids?.length === 1) {
    resolverAction.instanceIds = [cards.ids[0]];
    return [resolverAction, pendingChoices];
  }
  const choices = cardSelector(cards, instanceId, gameState, defs, stickerDefs);
  if (choices.length === 0) {
    resolverAction.instanceIds = undefined;
    return [resolverAction, pendingChoices];
  }
  const pickCount = getPickCount(ctx);
  const { pickMin, pickMax } = getPickBounds(ctx);
  if (
    choices.length === 1 ||
    (cards.scope &&
      (cards.scope.includes(TargetScope.SELF) || cards.scope.includes(TargetScope.TOP_OF_DECK)))
  ) {
    resolverAction.instanceIds = [choices[0]];
    return [resolverAction, pendingChoices];
  }
  if (choices.length <= pickCount) {
    resolverAction.instanceIds = choices;
    return [resolverAction, pendingChoices];
  }
  pendingChoices.push({
    id: `${instanceId}-${actionId}`,
    kind: actionType,
    type: PendingChoiceType.CHOOSE_CARD,
    sourceInstanceId: instanceId,
    choices,
    pickCount,
    pickMin,
    pickMax,
    isMandatory,
  });
  return [resolverAction, pendingChoices];
}

function resolveResourceTarget(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  resources: ResourceSelector,
): [ResolvedActionEffect, PendingChoice[]] {
  const { actionId, actionType, instanceId, isMandatory, gameState, defs, stickerDefs } = ctx;

  if (resources.choice && resources.choice.length > 1) {
    pendingChoices.push({
      id: `${instanceId}-${actionId}`,
      kind: actionType,
      type: PendingChoiceType.CHOOSE_RESOURCE,
      sourceInstanceId: instanceId,
      choices: resources.choice as Resources[],
      pickCount: 1,
      isMandatory,
    });
    return [resolverAction, pendingChoices];
  }
  if (resources.cards) {
    const choices = cardSelector(resources.cards, instanceId, gameState, defs, stickerDefs);
    if (choices.length === 0) {
      resolverAction.resources = {};
    } else if (choices.length === 1) {
      const state = getActiveState(gameState.instances[choices[0]], defs);
      resolverAction.resources = state.productions?.[0] ?? {};
    } else {
      pendingChoices.push({
        id: `${instanceId}-${actionId}`,
        kind: actionType,
        type: PendingChoiceType.CHOOSE_CARD,
        sourceInstanceId: instanceId,
        choices,
        pickCount: getPickCount(ctx),
        pickMin: getPickBounds(ctx).pickMin,
        pickMax: getPickBounds(ctx).pickMax,
        isMandatory,
      });
    }
    return [resolverAction, pendingChoices];
  }
  resolverAction.resources = extractResources(resources);
  return [resolverAction, pendingChoices];
}

function resolveStickerTarget(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  stickerIds: number[],
): [ResolvedActionEffect, PendingChoice[]] {
  const { actionId, actionType, instanceId, isMandatory } = ctx;

  if (stickerIds.length === 1) {
    resolverAction.stickerId = stickerIds[0];
    return [resolverAction, pendingChoices];
  }
  pendingChoices.push({
    id: `${instanceId}-${actionId}`,
    kind: actionType,
    type: PendingChoiceType.CHOOSE_STICKER,
    sourceInstanceId: instanceId,
    choices: stickerIds,
    pickCount: 1,
    isMandatory,
  });
  return [resolverAction, pendingChoices];
}

function resolveStateTarget(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  states: number[],
): [ResolvedActionEffect, PendingChoice[]] {
  const { actionId, actionType, instanceId, isMandatory } = ctx;

  if (states.length === 1) {
    resolverAction.stateId = states[0];
    return [resolverAction, pendingChoices];
  }
  pendingChoices.push({
    id: `${instanceId}-${actionId}`,
    kind: actionType,
    type: PendingChoiceType.CHOOSE_STATE,
    sourceInstanceId: instanceId,
    choices: states,
    pickCount: 1,
    isMandatory,
  });
  return [resolverAction, pendingChoices];
}

/** Strips the `choice` and `cards` sub-fields from Action.resources to get plain Resources. */
function extractResources(raw: NonNullable<ActionEffect['resources']>): Resources {
  const { choice: _choice, cards: _cards, ...rest } = raw;
  return rest as Resources;
}

// For BOOST_CARD, all produced resources are injected as potential criteria before resolving targets.
// For DISCOVER_CARD, the scope is forced to the discovery pile.
function getEnrichedCardSelector(action: ActionEffect): CardeSelector | undefined {
  if (!action.cards) return undefined;
  if (action.type === ActionEffectType.BOOST_CARD) {
    return { ...action.cards, produces: Object.values(ResourceType) };
  }
  if (action.type === ActionEffectType.DISCOVER_CARD) {
    return { ...action.cards, scope: [TargetScope.DISCOVERY] };
  }
  return action.cards;
}

export function resolveActionEffect(
  action: ActionEffect,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  isMandatory = false,
): [ResolvedActionEffect, PendingChoice[]] {
  let resolverAction: ResolvedActionEffect = {
    id: `${instanceId}-${action.id}`,
    type: action.type,
    sourceInstanceId: instanceId,
  };
  let pendingChoices: PendingChoice[] = [];

  const ctx: ResolveContext = {
    actionId: action.id,
    actionType: action.type,
    instanceId,
    pickNumber: action.pickNumber,
    pickMin: action.pickMin,
    pickMax: action.pickMax,
    isMandatory,
    gameState,
    defs,
    stickerDefs,
  };

  if (action.type === ActionEffectType.CHOOSE_EFFECT && action.effects) {
    resolveChooseActionEffect(resolverAction, pendingChoices, ctx, action.effects);
  }

  if (action.valuePerElement) {
    [resolverAction, pendingChoices] = resolveValuePerElement(
      resolverAction,
      pendingChoices,
      ctx,
      action.valuePerElement,
    );
  }

  const cards = getEnrichedCardSelector(action);
  if (cards) {
    [resolverAction, pendingChoices] = resolveCardTarget(
      resolverAction,
      pendingChoices,
      ctx,
      cards,
    );
  }

  if (action.resources) {
    [resolverAction, pendingChoices] = resolveResourceTarget(
      resolverAction,
      pendingChoices,
      ctx,
      action.resources,
    );
  }

  if (action.stickerIds) {
    [resolverAction, pendingChoices] = resolveStickerTarget(
      resolverAction,
      pendingChoices,
      ctx,
      action.stickerIds,
    );
  }

  if (action.states) {
    [resolverAction, pendingChoices] = resolveStateTarget(
      resolverAction,
      pendingChoices,
      ctx,
      action.states,
    );
  }

  if (action.accumulated) resolverAction.accumulated = action.accumulated;
  if (action.type === ActionEffectType.ADD_BOARD_EFFECT && action.effect) {
    resolverAction.effect = action.effect;
  }
  if (action.type === ActionEffectType.TRACK_ADVANCE && cards) {
    return resolveTrackAdvanceEffect(resolverAction, pendingChoices, ctx, cards);
  }

  return [resolverAction, pendingChoices];
}
