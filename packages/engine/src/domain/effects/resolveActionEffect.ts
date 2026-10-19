import { getDefeatAction } from '../cardAction/getDefeatAction';
import { canAffordCost } from '../cards/canAffordCost';
import { getEffectiveActionCost } from '../cards/getEffectiveActionCost';
import { getEffectiveUpgradeCost } from '../cards/getEffectiveUpgradeCost';
import { cardSelector } from '../cards/selection/cardSelector';
import { countValuePerElement } from '../cards/selection/countValuePerElement';
import { getActiveState } from '../cards/selection/getActiveState';
import { getAffectedCardsByBoardEffects } from '../cards/selection/getAffectedCardsByBoardEffects';
import { getEffectiveProductions } from '../cards/selection/getEffectiveProductions';
import { getStateActions } from '../cards/selection/getStateActions';
import { getTotalProduction } from '../cards/selection/getTotalProduction';
import {
  ActionEffectType,
  PassiveType,
  PendingChoiceType,
  ResourceType,
  TargetScope,
} from '../enums';
import { CardChoiceStrategy } from '../playerChoice/CardChoiceStrategy';
import { fixResources } from '../resources/fixResources';
import { mergeResources } from '../resources/mergeResources';
import { stateSelector } from '../stateSelector';
import type {
  ActionEffect,
  CardDef,
  CardSelector,
  Cost,
  GameState,
  PendingChoice,
  RemovedResourceScope,
  ResolvedActionEffect,
  ResourceSelector,
  Resources,
  StateSelector,
  Sticker,
  StickerSelector,
} from '../types';
import { chooseUsedAction } from './chooseUsedAction';
import { getPickNumbers } from './getPickNumbers';

const STICKER_PRODUCTION_CAP = 9;

export interface ResolveActionEffectOptions {
  isMandatory?: boolean;
  parentActionId?: string;
  lastSelectedIds?: number[];
}

interface ResolveContext {
  effectId: number;
  parentActionId?: string;
  sourceStepId?: number;
  actionType: ActionEffectType;
  instanceId: number;
  isMandatory: boolean;
  gameState: GameState;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  lastSelectedIds?: number[];
  resourceScopes?: RemovedResourceScope[];
}

function resolveTrackAdvanceEffect(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  cards: CardSelector,
  steps: { pickNumber?: number; pickMin?: number; pickMax?: number },
): [ResolvedActionEffect, PendingChoice[]] {
  const {
    effectId,
    parentActionId,
    actionType,
    instanceId,
    isMandatory,
    gameState,
    defs,
    stickerDefs,
  } = ctx;

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
    resolverAction.stepIds = sortedSteps.slice(0, steps.pickNumber ?? 1).map(s => s.id);
    resolverAction.newActionEffects = resolverAction.stepIds.flatMap(stepId =>
      (track.steps.find(s => s.id === stepId)?.effects ?? []).map(e => ({
        ...e,
        sourceStepId: stepId,
      })),
    );
    return [resolverAction, pendingChoices];
  } else {
    const choices = availableSteps
      .filter(
        s =>
          !targetInst.trackProgress.includes(s.id) &&
          canAffordCost(s.cost, instanceId, gameState, defs, stickerDefs),
      )
      .map(s => s.id);

    const picks = getPickNumbers(steps, choices.length);
    pendingChoices.push({
      id: `${instanceId}-${effectId}`,
      actionId: parentActionId,
      effectId,
      sourceStepId: ctx.sourceStepId,
      kind: actionType,
      type: PendingChoiceType.CHOOSE_STEP,
      sourceInstanceId: instanceId,
      targetInstanceId: targetId,
      choices,
      ...picks,
      isMandatory,
    });
  }

  return [resolverAction, pendingChoices];
}

function resolveChooseActionEffect(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  effects: ActionEffect[],
): [ResolvedActionEffect, PendingChoice[]] {
  const { instanceId, effectId, parentActionId, sourceStepId, actionType } = ctx;
  const choiceId = `${instanceId}-${effectId}`;
  pendingChoices.push({
    id: choiceId,
    actionId: parentActionId,
    effectId,
    sourceStepId,
    kind: actionType,
    type: PendingChoiceType.CHOOSE_ACTION_EFFECT,
    sourceInstanceId: instanceId,
    choices: effects,
    pickMin: 1,
    pickMax: 1,
    isMandatory: true,
  });
  return [resolverAction, pendingChoices];
}

/** USE_CARD_ACTION: the chosen action's effects follow, resolved for the card that owns it. */
function resolveUseCardAction(
  resolverAction: ResolvedActionEffect,
  ctx: ResolveContext,
  action: ActionEffect,
  cards: CardSelector | undefined,
): [ResolvedActionEffect, PendingChoice[]] {
  const { gameState, defs, stickerDefs } = ctx;
  if (action.usedAction) {
    const { instanceId, actionId } = action.usedAction;
    const used = getStateActions(gameState.instances[instanceId], defs, stickerDefs).find(
      a => a.id === actionId,
    );
    resolverAction.instanceIds = [instanceId];
    resolverAction.newActionEffects = (used?.actionEffects ?? []).map(effect => ({
      ...effect,
      sourceInstanceId: instanceId,
    }));
    return [resolverAction, []];
  }
  if (!cards) return [resolverAction, []];
  const [targeted, pendingChoices] = resolveCardTarget(resolverAction, [], ctx, cards);
  if (pendingChoices.length > 0 || targeted.unresolvable) return [targeted, pendingChoices];
  return chooseUsedAction(
    targeted,
    targeted.instanceIds?.[0],
    {
      id: `${ctx.instanceId}-${ctx.effectId}`,
      actionId: ctx.parentActionId,
      effectId: ctx.effectId,
      sourceStepId: ctx.sourceStepId,
      kind: ctx.actionType,
      sourceInstanceId: ctx.instanceId,
      isMandatory: ctx.isMandatory,
    },
    gameState,
    defs,
    stickerDefs,
  );
}

function resolveCardTarget(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  cards: CardSelector,
): [ResolvedActionEffect, PendingChoice[]] {
  const {
    effectId,
    parentActionId,
    actionType,
    instanceId,
    isMandatory,
    gameState,
    defs,
    stickerDefs,
  } = ctx;

  const isStickerAction =
    actionType === ActionEffectType.ADD_STICKER || actionType === ActionEffectType.BOOST_CARD;
  const cantBeDestroyedInstanceIds =
    actionType === ActionEffectType.DESTROY_CARD
      ? new Set(
          Object.values(
            getAffectedCardsByBoardEffects(gameState, PassiveType.CANT_BE_DESTROYED),
          ).flat(),
        )
      : null;

  const choices = cardSelector(cards, instanceId, gameState, defs, stickerDefs).filter(
    id =>
      (!isStickerAction ||
        getTotalProduction(id, gameState, defs, stickerDefs) < STICKER_PRODUCTION_CAP) &&
      (actionType !== ActionEffectType.DESTROY_CARD || !cantBeDestroyedInstanceIds?.has(id)) &&
      // Only an enemy with a defeat action can be defeated.
      (actionType !== ActionEffectType.DEFEAT_CARD ||
        getDefeatAction(gameState, id, defs) !== undefined),
  );

  const picks = getPickNumbers(cards, choices.length);
  if (cards.pickMin && choices.length < cards.pickMin) {
    resolverAction.unresolvable = true;
    return [resolverAction, pendingChoices];
  }

  if (
    choices.length === 0 ||
    choices.length < picks.pickMin ||
    (picks.pickMax === picks.pickMin &&
      actionType === ActionEffectType.DISCOVER_CARD &&
      choices.length <= picks.pickMax) ||
    (cards.scope?.length === 1 &&
      (cards.scope.includes(TargetScope.SELF) ||
        cards.scope.includes(TargetScope.TRIGGER_SOURCE) ||
        (cards.scope.includes(TargetScope.LAST_SELECTED) && !cards.pickNumber && !cards.pickMax) ||
        cards.scope.includes(TargetScope.TOP_OF_DECK) ||
        cards.scope.includes(TargetScope.TOP_OF_DISCARD))) ||
    cards.ids?.length === 1 ||
    cards.autoPick
  ) {
    resolverAction.instanceIds = choices;
    return [resolverAction, pendingChoices];
  }

  pendingChoices.push({
    id: `${instanceId}-${effectId}`,
    actionId: parentActionId,
    effectId,
    sourceStepId: ctx.sourceStepId,
    kind: actionType,
    type: PendingChoiceType.CHOOSE_CARD,
    sourceInstanceId: instanceId,
    choices,
    ...picks,
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
  const {
    effectId,
    parentActionId,
    actionType,
    instanceId,
    isMandatory,
    gameState,
    defs,
    stickerDefs,
    lastSelectedIds,
  } = ctx;

  if (resources.choice && resources.choice.length > 0) {
    const expandedChoices = expandResourceChoiceOptions(resources.choice);
    const picks = getPickNumbers(resources, expandedChoices.length);

    if (expandedChoices.length <= 1) {
      resolverAction.resources = expandedChoices[0] ?? {};
      return [resolverAction, pendingChoices];
    }

    pendingChoices.push({
      id: `${instanceId}-${effectId}`,
      actionId: parentActionId,
      effectId,
      sourceStepId: ctx.sourceStepId,
      kind: actionType,
      type: PendingChoiceType.CHOOSE_RESOURCE,
      sourceInstanceId: instanceId,
      choices: expandedChoices,
      resourceScopes: ctx.resourceScopes,
      ...picks,
      isMandatory,
    });
    return [resolverAction, pendingChoices];
  }

  const picks = getPickNumbers(resources, resources.choice?.length);

  if (resources.cards) {
    const choices = cardSelector(
      { ...resources.cards, lastSelectedIds },
      instanceId,
      gameState,
      defs,
      stickerDefs,
    );
    if (choices.length === 0) {
      resolverAction.resources = {};
    } else if (resources.cards.autoPick) {
      return gainEveryProduction(resolverAction, pendingChoices, ctx, choices);
    } else if (choices.length === 1) {
      const state = getActiveState(gameState.instances[choices[0]], defs);
      if (state.productions && state.productions.length > 1) {
        pendingChoices.push({
          id: `${instanceId}-${effectId}`,
          actionId: parentActionId,
          effectId,
          sourceStepId: ctx.sourceStepId,
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
            ),
          ),
          resourceScopes: ctx.resourceScopes,
          ...picks,
          isMandatory,
        });
      } else {
        [resolverAction, pendingChoices] = new CardChoiceStrategy(defs, stickerDefs).apply(
          {
            id: `${instanceId}-${effectId}`,
            type: actionType,
            sourceInstanceId: instanceId,
            instanceIds: choices,
          },
          resolverAction,
          gameState,
          pendingChoices,
        );
      }
    } else {
      pendingChoices.push({
        id: `${instanceId}-${effectId}`,
        actionId: parentActionId,
        effectId,
        sourceStepId: ctx.sourceStepId,
        kind: actionType,
        type: PendingChoiceType.CHOOSE_CARD,
        sourceInstanceId: instanceId,
        choices,
        ...picks,
        isMandatory,
      });
    }
    return [resolverAction, pendingChoices];
  }
  resolverAction.resources = extractResources(resources);
  return [resolverAction, pendingChoices];
}

/** "Gain each person's production": every card's production, its choice when it has several. */
function gainEveryProduction(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  instanceIds: number[],
): [ResolvedActionEffect, PendingChoice[]] {
  const { gameState, defs, stickerDefs } = ctx;
  let resources: Resources = {};
  instanceIds.forEach(id => {
    const instance = gameState.instances[id];
    const productions = (getActiveState(instance, defs).productions ?? []).map(p =>
      getEffectiveProductions(p, gameState, defs, instance, stickerDefs),
    );
    if (productions.length === 1) resources = mergeResources(resources, productions[0]);
    if (productions.length > 1) {
      pendingChoices.push({
        id: `${ctx.instanceId}-${ctx.effectId}-${id}`,
        actionId: ctx.parentActionId,
        effectId: ctx.effectId,
        sourceStepId: ctx.sourceStepId,
        kind: ctx.actionType,
        type: PendingChoiceType.CHOOSE_RESOURCE,
        sourceInstanceId: ctx.instanceId,
        targetInstanceId: id,
        choices: productions,
        pickMin: 1,
        pickMax: 1,
        isMandatory: ctx.isMandatory,
      });
    }
  });
  resolverAction.resources = resources;
  return [resolverAction, pendingChoices];
}

function getEffectiveProductionKeys(
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): Set<string> {
  const instance = gameState.instances[instanceId];
  if (!instance) return new Set();

  const state = getActiveState(instance, defs);
  const baseProductions = state.productions?.length ? state.productions : [{}];

  const keys = baseProductions.flatMap(prod =>
    Object.entries(getEffectiveProductions(prod, gameState, defs, instance, stickerDefs, false))
      .filter(([, value]) => (value ?? 0) > 0)
      .map(([resourceKey]) => resourceKey),
  );

  return new Set(keys);
}

function getCostResourceKeys(cost: Cost | undefined): Set<string> {
  if (!cost?.resources?.length) return new Set();

  const keys = cost.resources.flatMap(resourceCost =>
    Object.entries(fixResources(resourceCost))
      .filter(([, value]) => (value ?? 0) > 0)
      .map(([resourceKey]) => resourceKey),
  );

  return new Set(keys);
}

function getActionCostKeys(
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
): Set<string> {
  const instance = gameState.instances[instanceId];
  if (!instance) return new Set();
  const state = getActiveState(instance, defs);
  if (!state.actions?.length) return new Set();

  const keys = state.actions.flatMap(action => [
    ...getCostResourceKeys(getEffectiveActionCost(action.cost, instance)),
  ]);

  return new Set(keys);
}

function getUpgradeCostKeys(
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): Set<string> {
  const instance = gameState.instances[instanceId];
  if (!instance) return new Set();
  const state = getActiveState(instance, defs);
  if (!state.upgrade?.length) return new Set();

  const keys = state.upgrade.flatMap(upgrade => [
    ...getCostResourceKeys(
      getEffectiveUpgradeCost(upgrade.cost, gameState, defs, stickerDefs, instanceId),
    ),
  ]);

  return new Set(keys);
}

function getResourceKeysForScope(
  scope: RemovedResourceScope,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): Set<string> {
  switch (scope) {
    case 'production':
      return getEffectiveProductionKeys(instanceId, gameState, defs, stickerDefs);
    case 'actionCost':
      return getActionCostKeys(instanceId, gameState, defs);
    case 'upgradeCost':
      return getUpgradeCostKeys(instanceId, gameState, defs, stickerDefs);
  }
}

function getCandidateResourceKeys(
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  resourceScopes: RemovedResourceScope[] | undefined,
): Set<string> {
  const scopes = resourceScopes?.length
    ? resourceScopes
    : (['production', 'actionCost', 'upgradeCost'] as RemovedResourceScope[]);

  return scopes.reduce((acc, scope) => {
    getResourceKeysForScope(scope, instanceId, gameState, defs, stickerDefs).forEach(key =>
      acc.add(key),
    );
    return acc;
  }, new Set<string>());
}

function getAllowedResourceKeys(resources: ResourceSelector | undefined): Set<string> {
  if (!resources) return new Set();

  if (resources.choice?.length) {
    const options = expandResourceChoiceOptions(resources.choice);
    const keys = options.flatMap(option =>
      Object.entries(option)
        .filter(([, value]) => (value ?? 0) > 0)
        .map(([resourceKey]) => resourceKey),
    );
    return new Set(keys);
  }

  const keys = Object.entries(extractResources(resources))
    .filter(([, value]) => (value ?? 0) > 0)
    .map(([resourceKey]) => resourceKey);
  return new Set(keys);
}

function filterRemoveResourceCardChoices(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  resources: ResourceSelector | undefined,
  resourceScopes: RemovedResourceScope[] | undefined,
): [ResolvedActionEffect, PendingChoice[]] {
  const allowedResourceKeys = getAllowedResourceKeys(resources);
  if (allowedResourceKeys.size === 0) return [resolverAction, pendingChoices];

  const targetChoiceIndex = pendingChoices.findIndex(
    choice =>
      choice.type === PendingChoiceType.CHOOSE_CARD &&
      choice.kind === ActionEffectType.REMOVE_RESOURCE_ON_CARD,
  );

  if (targetChoiceIndex === -1) return [resolverAction, pendingChoices];

  const targetChoice = pendingChoices[targetChoiceIndex];
  const filteredIds = targetChoice.choices.filter((option): option is number => {
    if (typeof option !== 'number') return false;
    const candidateKeys = getCandidateResourceKeys(
      option,
      gameState,
      defs,
      stickerDefs,
      resourceScopes,
    );
    return [...candidateKeys].some(resourceKey => allowedResourceKeys.has(resourceKey));
  });

  if (filteredIds.length === 0) {
    return [{ ...resolverAction, unresolvable: true }, []];
  }

  const nextPendingChoices = [...pendingChoices];
  nextPendingChoices[targetChoiceIndex] = {
    ...targetChoice,
    choices: filteredIds,
    pickMin: Math.min(targetChoice.pickMin, filteredIds.length),
    pickMax: Math.min(targetChoice.pickMax, filteredIds.length),
  };

  return [resolverAction, nextPendingChoices];
}

function resolveResourcesForAction(
  action: ActionEffect,
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
): [ResolvedActionEffect, PendingChoice[]] {
  if (!action.resources) return [resolverAction, pendingChoices];

  let nextResolvedAction = resolverAction;
  let nextPendingChoices = pendingChoices;

  [nextResolvedAction, nextPendingChoices] = resolveResourceTarget(
    nextResolvedAction,
    nextPendingChoices,
    ctx,
    action.resources,
  );

  if (action.type !== ActionEffectType.REMOVE_RESOURCE_ON_CARD) {
    return [nextResolvedAction, nextPendingChoices];
  }

  return filterRemoveResourceCardChoices(
    nextResolvedAction,
    nextPendingChoices,
    ctx.gameState,
    ctx.defs,
    ctx.stickerDefs,
    action.resources,
    action.resourceScopes,
  );
}

function buildResolveContext(params: {
  action: ActionEffect;
  instanceId: number;
  gameState: GameState;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  isMandatory: boolean;
  parentActionId?: string;
  lastSelectedIds?: number[];
}): ResolveContext {
  const {
    action,
    instanceId,
    gameState,
    defs,
    stickerDefs,
    isMandatory,
    parentActionId,
    lastSelectedIds,
  } = params;

  return {
    effectId: action.id,
    parentActionId,
    sourceStepId: action.sourceStepId,
    actionType: action.type,
    instanceId,
    isMandatory,
    gameState,
    defs,
    stickerDefs,
    lastSelectedIds,
    resourceScopes:
      action.type === ActionEffectType.REMOVE_RESOURCE_ON_CARD ? action.resourceScopes : undefined,
  };
}

function resolveStickerTarget(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  stickers: StickerSelector,
): [ResolvedActionEffect, PendingChoice[]] {
  const { effectId, parentActionId, actionType, instanceId, isMandatory, gameState } = ctx;
  const availableIds = (stickers.ids ?? []).filter(id => (gameState.stickerStock[id] ?? 0) > 0);
  const picks = getPickNumbers(stickers, availableIds.length);
  if (stickers.pickMin && availableIds.length < stickers.pickMin) {
    resolverAction.unresolvable = true;
    return [resolverAction, pendingChoices];
  }
  if (availableIds.length <= picks.pickMax) {
    resolverAction.stickerIds = availableIds;
    return [resolverAction, pendingChoices];
  }
  pendingChoices.push({
    id: `${instanceId}-${effectId}`,
    actionId: parentActionId,
    effectId,
    sourceStepId: ctx.sourceStepId,
    kind: actionType,
    type: PendingChoiceType.CHOOSE_STICKER,
    sourceInstanceId: instanceId,
    choices: availableIds,
    ...picks,
    isMandatory,
  });
  return [resolverAction, pendingChoices];
}

function resolveStateTarget(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
  states: StateSelector,
): [ResolvedActionEffect, PendingChoice[]] {
  const {
    effectId,
    parentActionId,
    actionType,
    instanceId,
    isMandatory,
    gameState,
    defs,
    stickerDefs,
  } = ctx;

  const choices = stateSelector(states, instanceId, gameState, defs, stickerDefs);
  if (choices.length === 1) {
    resolverAction.stateId = choices[0];
    return [resolverAction, pendingChoices];
  }
  pendingChoices.push({
    id: `${instanceId}-${effectId}`,
    actionId: parentActionId,
    effectId,
    sourceStepId: ctx.sourceStepId,
    kind: actionType,
    type: PendingChoiceType.CHOOSE_STATE,
    sourceInstanceId: instanceId,
    choices,
    pickMin: 1,
    pickMax: 1,
    isMandatory,
  });
  return [resolverAction, pendingChoices];
}

function resolveUpgradeStateTarget(
  resolverAction: ResolvedActionEffect,
  pendingChoices: PendingChoice[],
  ctx: ResolveContext,
): [ResolvedActionEffect, PendingChoice[]] {
  const { effectId, parentActionId, actionType, instanceId, isMandatory, gameState, defs } = ctx;

  if (actionType !== ActionEffectType.UPGRADE_CARD) {
    return [resolverAction, pendingChoices];
  }

  if (resolverAction.stateId !== undefined) {
    return [resolverAction, pendingChoices];
  }

  const hasStateChoice = pendingChoices.some(
    choice => choice.type === PendingChoiceType.CHOOSE_STATE,
  );
  if (hasStateChoice) {
    return [resolverAction, pendingChoices];
  }

  const targetId = resolverAction.instanceIds?.[0];
  if (targetId === undefined) {
    return [resolverAction, pendingChoices];
  }

  const targetInstance = gameState.instances[targetId];
  if (!targetInstance) {
    return [resolverAction, pendingChoices];
  }

  const targetState = getActiveState(targetInstance, defs);
  const choices = [...new Set((targetState.upgrade ?? []).map(upgrade => upgrade.upgradeTo))];

  if (choices.length === 1) {
    resolverAction.stateId = choices[0];
    return [resolverAction, pendingChoices];
  }

  if (choices.length > 1) {
    pendingChoices.push({
      id: `${instanceId}-${effectId}`,
      actionId: parentActionId,
      effectId,
      sourceStepId: ctx.sourceStepId,
      kind: actionType,
      type: PendingChoiceType.CHOOSE_STATE,
      sourceInstanceId: instanceId,
      targetInstanceId: targetId,
      choices,
      pickMin: 1,
      pickMax: 1,
      isMandatory,
    });
  }

  return [resolverAction, pendingChoices];
}

/** Strips the `choice` and `cards` sub-fields from Action.resources to get plain Resources. */
function extractResources(raw: NonNullable<ActionEffect['resources']>): Resources {
  const { choice: _choice, cards: _cards, ...rest } = raw;
  return rest;
}

function expandResourceChoiceOptions(
  choices: NonNullable<NonNullable<ActionEffect['resources']>['choice']>,
): Resources[] {
  return choices.flatMap(choice => {
    const { any, ...fixedResources } = choice;
    const base = fixedResources as Resources;
    const anyAmount = any ?? 0;

    if (anyAmount <= 0) {
      return [base];
    }

    return Object.values(ResourceType).map(resourceType => ({
      ...base,
      [resourceType]: (base[resourceType] ?? 0) + anyAmount,
    }));
  });
}

function applyActionMetadata(resolverAction: ResolvedActionEffect, action: ActionEffect): void {
  if (action.payingCost !== undefined) resolverAction.payingCost = action.payingCost;
  if (action.value !== undefined) resolverAction.value = action.value;
  if (action.position !== undefined) resolverAction.position = action.position;
  if (action.deck) {
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
function getEnrichedCardSelector(
  action: ActionEffect,
  lastSelectedIds?: number[],
): CardSelector | undefined {
  if (!action.cards) return undefined;
  if (action.type === ActionEffectType.BOOST_CARD) {
    return { ...action.cards, lastSelectedIds, produces: Object.values(ResourceType) };
  }
  if (action.type === ActionEffectType.DISCOVER_CARD && !action.cards.scope?.length) {
    return { ...action.cards, lastSelectedIds, scope: [TargetScope.DISCOVERY] };
  }
  return { ...action.cards, lastSelectedIds };
}

/**
 * Triggers queued before EDR-046 keep their stored definition: "discover the top of the
 * discovery pile" (the removed `top_of_discovery` scope) is now ADVANCE_STORY.
 */
function upgradeLegacyEffect(action: ActionEffect): ActionEffect {
  const scope = action.cards?.scope as string[] | undefined;
  if (action.type !== ActionEffectType.DISCOVER_CARD || !scope?.includes('top_of_discovery')) {
    return action;
  }
  return { id: action.id, type: ActionEffectType.ADVANCE_STORY, value: action.cards?.pickNumber };
}

function resolveTrackAdvance(
  action: ActionEffect,
  cards: CardSelector,
  resolverAction: ResolvedActionEffect,
  ctx: ResolveContext,
): [ResolvedActionEffect, PendingChoice[]] {
  const { instanceId, gameState, defs, stickerDefs, lastSelectedIds } = ctx;
  resolverAction.payingCost = action.payingCost ?? resolverAction.payingCost;
  const trackCards: CardSelector = { ...cards, lastSelectedIds };
  const steps = action.steps ?? {};
  if (action.valuePerElement) {
    const derivedPick = Math.floor(
      countValuePerElement(
        action.valuePerElement,
        gameState,
        instanceId,
        defs,
        stickerDefs,
        lastSelectedIds,
      ) * action.valuePerElement.amount,
    );

    steps.pickNumber = derivedPick;
  }
  // Populate instanceIds from the card selector before delegating — preserved as fallback when
  // the target has no track or all steps are complete.
  const targetIds = cardSelector(trackCards, instanceId, gameState, defs, stickerDefs);
  if (targetIds.length > 0) resolverAction.instanceIds = [targetIds[0]];
  return resolveTrackAdvanceEffect(resolverAction, [], ctx, trackCards, steps);
}

export function resolveActionEffect(
  storedAction: ActionEffect,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
  options: ResolveActionEffectOptions = {},
): [ResolvedActionEffect, PendingChoice[]] {
  const action = upgradeLegacyEffect(storedAction);
  const isMandatory = options.isMandatory ?? false;
  const parentActionId = options.parentActionId;
  const lastSelectedIds = options.lastSelectedIds;

  let resolverAction: ResolvedActionEffect = {
    id: `${instanceId}-${action.id}`,
    type: action.type,
    sourceInstanceId: instanceId,
  };
  let pendingChoices: PendingChoice[] = [];
  const enrichedCards = getEnrichedCardSelector(action, lastSelectedIds);

  const ctx = buildResolveContext({
    action,
    instanceId,
    gameState,
    defs,
    stickerDefs,
    isMandatory,
    parentActionId,
    lastSelectedIds,
  });

  if (action.type === ActionEffectType.TRACK_ADVANCE && action.cards) {
    return resolveTrackAdvance(action, action.cards, resolverAction, ctx);
  }

  if (action.type === ActionEffectType.USE_CARD_ACTION) {
    return resolveUseCardAction(resolverAction, ctx, action, enrichedCards);
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
      action.valuePerElement.amount *
      countValuePerElement(
        action.valuePerElement,
        gameState,
        instanceId,
        defs,
        stickerDefs,
        lastSelectedIds,
      );
  }

  if (enrichedCards) {
    [resolverAction, pendingChoices] = resolveCardTarget(
      resolverAction,
      pendingChoices,
      ctx,
      enrichedCards,
    );
    if (resolverAction.unresolvable) {
      return [resolverAction, pendingChoices];
    }
  }

  if (action.states) {
    [resolverAction, pendingChoices] = resolveStateTarget(
      resolverAction,
      pendingChoices,
      ctx,
      action.states,
    );
  }

  [resolverAction, pendingChoices] = resolveUpgradeStateTarget(resolverAction, pendingChoices, ctx);

  [resolverAction, pendingChoices] = resolveResourcesForAction(
    action,
    resolverAction,
    pendingChoices,
    ctx,
  );
  if (resolverAction.unresolvable) {
    return [resolverAction, pendingChoices];
  }

  if (action.stickers) {
    [resolverAction, pendingChoices] = resolveStickerTarget(
      resolverAction,
      pendingChoices,
      ctx,
      action.stickers,
    );
  }

  applyActionMetadata(resolverAction, action);

  return [resolverAction, pendingChoices];
}
