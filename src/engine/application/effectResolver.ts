import { getActiveState } from '@engine/application/cardHelpers';
import { cardSelector } from '@engine/application/cardSelector';
import { ActionType, PendingChoiceType, ResourceType, TargetScope } from '@engine/domain/enums';
import type {
  ActionEffect,
  CardDef,
  CardeSelector,
  GameState,
  Passive,
  PendingChoice,
  ResolvedAction,
  ResourceSelector,
  Resources,
  ValuePerElement,
} from '@engine/domain/types';

interface ResolveContext {
  actionId: number;
  actionType: ActionType;
  instanceId: number;
  isMandatory: boolean;
  gameState: GameState;
  defs: Record<number, CardDef> | undefined;
  resolverAction: ResolvedAction;
  pendingChoices: PendingChoice[];
}

export function resolveActionEffect(
  action: ActionEffect,
  instanceId: number,
  gameState: GameState,
  defs?: Record<number, CardDef>,
  isMandatory = false,
): [ResolvedAction, PendingChoice[]] {
  const resolverAction: ResolvedAction = {
    id: `${instanceId}-${action.id}`,
    type: action.type,
    sourceInstanceId: instanceId,
  };
  const pendingChoices: PendingChoice[] = [];

  const ctx: ResolveContext = {
    actionId: action.id,
    actionType: action.type,
    instanceId,
    isMandatory,
    gameState,
    defs,
    resolverAction,
    pendingChoices,
  };

  if (action.type === ActionType.ADD_BOARD_EFFECT && action.effect) {
    return resolveBoardEffect(ctx, action.effect, action.cards);
  }

  if (action.type === ActionType.TRACK_ADVANCE && action.cards) {
    return resolveTrackAdvanceEffect(ctx, action.cards);
  }

  if (action.type === ActionType.BOOST_CARD) {
    action.cards = { ...action.cards, produces: Object.values(ResourceType) };
  }

  if (action.valuePerElement) {
    resolveValuePerElement(ctx, action.valuePerElement);
  }

  if (action.cards) {
    resolveCardTarget(ctx, action.cards);
  }

  if (action.resources) {
    resolveResourceTarget(ctx, action.resources);
  }

  if (action.stickerIds) {
    resolveStickerTarget(ctx, action.stickerIds);
  }

  if (action.states) {
    resolveStateTarget(ctx, action.states);
  }

  if (action.accumulated) {
    resolverAction.accumulated = action.accumulated;
  }

  return [resolverAction, pendingChoices];
}

function resolveTrackAdvanceEffect(
  ctx: ResolveContext,
  cards: CardeSelector | undefined,
): [ResolvedAction, PendingChoice[]] {
  const {
    actionId,
    actionType,
    instanceId,
    isMandatory,
    gameState,
    defs,
    resolverAction,
    pendingChoices,
  } = ctx;

  if (!cards || !defs) return [resolverAction, pendingChoices];

  const targetIds = cardSelector(cards, instanceId, gameState, defs);
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
    const step = availableSteps.reduce((min, s) => (s.id < min.id ? s : min), availableSteps[0]);
    resolverAction.stepId = step.id;
  } else {
    pendingChoices.push({
      id: `${instanceId}-${actionId}`,
      kind: actionType,
      type: PendingChoiceType.CHOOSE_STEP,
      sourceInstanceId: instanceId,
      targetInstanceId: targetId,
      choices: availableSteps.map(s => s.id),
      pickCount: 1,
      isMandatory,
    });
  }

  return [resolverAction, pendingChoices];
}

function resolveBoardEffect(
  ctx: ResolveContext,
  effect: Passive,
  cards: CardeSelector | undefined,
): [ResolvedAction, PendingChoice[]] {
  const {
    actionId,
    actionType,
    instanceId,
    isMandatory,
    gameState,
    defs,
    resolverAction,
    pendingChoices,
  } = ctx;

  if (cards) {
    const instanceIds = cardSelector(cards, instanceId, gameState, defs);
    const pickCount = cards.number ?? 1;
    if (instanceIds.length > pickCount) {
      pendingChoices.push({
        id: `${instanceId}-${actionId}`,
        kind: actionType,
        type: PendingChoiceType.CHOOSE_CARD,
        sourceInstanceId: instanceId,
        choices: instanceIds,
        pickCount,
        isMandatory,
      });
    } else if (instanceIds.length > 0) {
      // Fewer or equal candidates than picks needed — apply to all automatically
      resolverAction.instanceIds = instanceIds;
    }
  }

  resolverAction.effect = effect;

  return [resolverAction, pendingChoices];
}

function resolveValuePerElement(ctx: ResolveContext, valuePerElement: ValuePerElement): void {
  const {
    gameState,
    instanceId,
    defs,
    actionId,
    resolverAction,
    actionType,
    pendingChoices,
    isMandatory,
  } = ctx;

  let number = 0;
  if (valuePerElement.cards) {
    number = cardSelector(valuePerElement.cards, instanceId, gameState, defs).length;
  } else if (valuePerElement.accumulation) {
    number = gameState.instances[instanceId].cumulated?.[valuePerElement.accumulation] ?? 0;
  }

  if (number === 0) {
    return;
  }

  if (valuePerElement.resource && valuePerElement.resource.length === 1) {
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
}

function resolveCardTarget(ctx: ResolveContext, cards: CardeSelector): void {
  const {
    actionId,
    actionType,
    instanceId,
    isMandatory,
    gameState,
    defs,
    resolverAction,
    pendingChoices,
  } = ctx;

  if (cards.ids?.length === 1) {
    resolverAction.instanceIds = [cards.ids[0]];
    return;
  }
  const choices = cardSelector(cards, instanceId, gameState, defs);
  if (choices.length === 0) {
    resolverAction.instanceIds = undefined;
    return;
  }
  const pickCount = cards.number ?? 1;
  if (
    choices.length === 1 ||
    (cards.scope &&
      (cards.scope.includes(TargetScope.SELF) || cards.scope.includes(TargetScope.TOP_OF_DECK)))
  ) {
    resolverAction.instanceIds = [choices[0]];
    return;
  }
  if (choices.length <= pickCount) {
    resolverAction.instanceIds = choices;
    return;
  }
  pendingChoices.push({
    id: `${instanceId}-${actionId}`,
    kind: actionType,
    type: PendingChoiceType.CHOOSE_CARD,
    sourceInstanceId: instanceId,
    choices,
    pickCount: cards.number ?? 1,
    isMandatory,
  });
}

function resolveResourceTarget(ctx: ResolveContext, resources: ResourceSelector): void {
  const {
    actionId,
    actionType,
    instanceId,
    isMandatory,
    gameState,
    defs,
    resolverAction,
    pendingChoices,
  } = ctx;

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
    return;
  }
  if (resources.cards) {
    const choices = cardSelector(resources.cards, instanceId, gameState, defs);
    if (choices.length === 0) {
      resolverAction.resources = {};
    } else if (choices.length === 1) {
      const instance = gameState.instances[choices[0]];
      const state = instance && defs ? getActiveState(instance, defs) : undefined;
      resolverAction.resources = state?.productions?.[0] ?? {};
    } else {
      pendingChoices.push({
        id: `${instanceId}-${actionId}`,
        kind: actionType,
        type: PendingChoiceType.CHOOSE_CARD,
        sourceInstanceId: instanceId,
        choices,
        pickCount: resources.cards.number ?? 1,
        isMandatory,
      });
    }
    return;
  }
  resolverAction.resources = extractResources(resources);
}

function resolveStickerTarget(ctx: ResolveContext, stickerIds: number[]): void {
  const { actionId, actionType, instanceId, isMandatory, resolverAction, pendingChoices } = ctx;

  if (stickerIds.length === 1) {
    resolverAction.stickerId = stickerIds[0];
    return;
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
}

function resolveStateTarget(ctx: ResolveContext, states: number[]): void {
  const { actionId, actionType, instanceId, isMandatory, resolverAction, pendingChoices } = ctx;

  if (states.length === 1) {
    resolverAction.stateId = states[0];
    return;
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
}

/** Strips the `choice` and `cards` sub-fields from Action.resources to get plain Resources. */
function extractResources(raw: NonNullable<ActionEffect['resources']>): Resources {
  const { choice: _choice, cards: _cards, ...rest } = raw;
  return rest as Resources;
}
