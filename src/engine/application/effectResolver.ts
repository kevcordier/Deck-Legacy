import {
  canAffordCost,
  getActiveState,
  getEffectiveProductions,
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
  CardSelector,
  GameState,
  PendingChoice,
  ResolvedActionEffect,
  ResourceSelector,
  Resources,
  Sticker,
  StickerSelector,
  ValuePerElement,
} from '@engine/domain/types';

interface ResolveContext {
  actionId: number;
  actionType: ActionEffectType;
  instanceId: number;
  isMandatory: boolean;
  gameState: GameState;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
}

function resolveTrackAdvanceEffect(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  cards: CardSelector,
  steps: { pickNumber?: number; pickMin?: number; pickMax?: number },
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
    const choices = availableSteps
      .filter(
        s =>
          !targetInst.trackProgress.includes(s.id) &&
          canAffordCost(s.cost, instanceId, gameState, defs, stickerDefs),
      )
      .map(s => s.id);
    pendingChoices.push({
      id: `${instanceId}-${actionId}`,
      kind: actionType,
      type: PendingChoiceType.CHOOSE_STEP,
      sourceInstanceId: instanceId,
      targetInstanceId: targetId,
      choices,
      pickCount: steps.pickNumber,
      pickMin: steps.pickMin,
      pickMax: steps.pickMax,
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
  } else if (valuePerElement.accumulation && gameState.instances[instanceId].cumulated >= 1) {
    count = gameState.instances[instanceId].cumulated;
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

function resolveCardTarget(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  cards: CardSelector,
): [ResolvedActionEffect, PendingChoice[]] {
  const { actionId, actionType, instanceId, isMandatory, gameState, defs, stickerDefs } = ctx;

  const choices = cardSelector(cards, instanceId, gameState, defs, stickerDefs);
  if (choices.length === 0) {
    resolverAction.instanceIds = undefined;
    return [resolverAction, pendingChoices];
  }
  const pickCount = cards.pickNumber;
  const pickMin = cards.pickMin;
  const pickMax = cards.pickMax;
  if (
    choices.length === 1 ||
    (cards.scope &&
      (cards.scope.includes(TargetScope.SELF) ||
        cards.scope.includes(TargetScope.TOP_OF_DECK) ||
        cards.scope.includes(TargetScope.TOP_OF_DISCARD)))
  ) {
    resolverAction.instanceIds = [choices[0]];
    return [resolverAction, pendingChoices];
  }
  if (pickCount && choices.length <= pickCount) {
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
      choices: resources.choice,
      pickCount: resources.pickNumber,
      pickMin: resources.pickMin,
      pickMax: resources.pickMax,
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
      if (state.productions && state.productions.length > 1) {
        pendingChoices.push({
          id: `${instanceId}-${actionId}`,
          kind: actionType,
          type: PendingChoiceType.CHOOSE_RESOURCE,
          sourceInstanceId: instanceId,
          choices: state.productions.map(p =>
            getEffectiveProductions(
              p,
              gameState,
              defs,
              gameState.instances[choices[0]],
              stickerDefs,
              {},
            ),
          ),
          pickCount: resources.pickNumber,
          pickMin: resources.pickMin,
          pickMax: resources.pickMax,
          isMandatory,
        });
      } else {
        resolverAction.resources = getEffectiveProductions(
          state.productions?.[0] ?? {},
          gameState,
          defs,
          gameState.instances[choices[0]],
          stickerDefs,
          {},
        );
      }
    } else {
      pendingChoices.push({
        id: `${instanceId}-${actionId}`,
        kind: actionType,
        type: PendingChoiceType.CHOOSE_CARD,
        sourceInstanceId: instanceId,
        choices,
        pickCount: resources.pickNumber,
        pickMin: resources.pickMin,
        pickMax: resources.pickMax,
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
  stickers: StickerSelector,
): [ResolvedActionEffect, PendingChoice[]] {
  const { actionId, actionType, instanceId, isMandatory } = ctx;

  if (stickers.ids && stickers.ids.length === stickers.pickNumber) {
    resolverAction.stickerIds = stickers.ids;
    return [resolverAction, pendingChoices];
  }
  pendingChoices.push({
    id: `${instanceId}-${actionId}`,
    kind: actionType,
    type: PendingChoiceType.CHOOSE_STICKER,
    sourceInstanceId: instanceId,
    choices: stickers.ids ?? [],
    pickCount: stickers.pickNumber,
    pickMin: stickers.pickMin,
    pickMax: stickers.pickMax,
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
  return rest;
}

function applyActionMetadata(resolverAction: ResolvedActionEffect, action: ActionEffect): void {
  if (action.payingCost !== undefined) resolverAction.payingCost = action.payingCost;
  if (action.value) resolverAction.value = action.value;
  if (action.position !== undefined) resolverAction.position = action.position;
  if (action.type === ActionEffectType.SHUFFLE_DECK && action.deck) {
    resolverAction.deck = action.deck;
  }
  if (action.type === ActionEffectType.REMOVE_RESOURCE_ON_CARD && action.resourceScopes) {
    resolverAction.resourceScopes = action.resourceScopes;
  }
  if (action.type === ActionEffectType.ADD_BOARD_EFFECT && action.effect) {
    resolverAction.effect = action.effect;
  }
}

// For BOOST_CARD, all produced resources are injected as potential criteria before resolving targets.
// For DISCOVER_CARD, the scope is forced to the discovery pile.
function getEnrichedCardSelector(action: ActionEffect): CardSelector | undefined {
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
    isMandatory,
    gameState,
    defs,
    stickerDefs,
  };

  if (action.type === ActionEffectType.TRACK_ADVANCE && action.cards) {
    const steps = action.steps ?? {};
    if (action.valuePerElement) {
      const derivedPick = Math.floor(
        countValuePerElement(action.valuePerElement, gameState, instanceId, defs, stickerDefs) *
          action.valuePerElement.amount,
      );
      steps.pickNumber = derivedPick;
      steps.pickMin = derivedPick;
      steps.pickMax = derivedPick;
    }
    // Populate instanceIds from the card selector before delegating — preserved as fallback when
    // the target has no track or all steps are complete.
    const targetIds = cardSelector(action.cards, instanceId, gameState, defs, stickerDefs);
    if (targetIds.length > 0) resolverAction.instanceIds = [targetIds[0]];
    return resolveTrackAdvanceEffect(resolverAction, pendingChoices, ctx, action.cards, steps);
  }

  if (action.type === ActionEffectType.CHOOSE_EFFECT && action.effects) {
    [resolverAction, pendingChoices] = resolveChooseActionEffect(
      resolverAction,
      pendingChoices,
      ctx,
      action.effects,
    );
  }

  if (action.valuePerElement) {
    resolverAction.value =
      (resolverAction.value ?? 1) *
      countValuePerElement(action.valuePerElement, gameState, instanceId, defs, stickerDefs);
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

  if (action.stickers) {
    [resolverAction, pendingChoices] = resolveStickerTarget(
      resolverAction,
      pendingChoices,
      ctx,
      action.stickers,
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

  applyActionMetadata(resolverAction, action);

  return [resolverAction, pendingChoices];
}
