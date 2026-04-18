import { cardSelector } from '@engine/application/cardSelector';
import { ActionType, PendingChoiceType, ResourceType, TargetScope } from '@engine/domain/enums';
import type {
  Action,
  CardDef,
  CardeSelector,
  GameState,
  Passive,
  PendingChoice,
  ResolvedAction,
  ResourceSelector,
  Resources,
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
  action: Action,
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

  if (action.type === ActionType.BOOST_CARD) {
    action.cards = { ...action.cards, produces: Object.values(ResourceType) };
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
    if (instanceIds.length > 1) {
      pendingChoices.push({
        id: `${instanceId}-${actionId}`,
        kind: actionType,
        type: PendingChoiceType.CHOOSE_CARD,
        sourceInstanceId: instanceId,
        choices: instanceIds,
        pickCount: 1,
        isMandatory,
      });
    } else if (instanceIds.length === 1) {
      resolverAction.instanceId = instanceIds[0];
    }
  }

  resolverAction.effect = effect;

  return [resolverAction, pendingChoices];
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
    resolverAction.instanceId = cards.ids[0];
    return;
  }
  const choices = cardSelector(cards, instanceId, gameState, defs);
  if (choices.length === 0) {
    resolverAction.instanceId = undefined;
    return;
  }
  if (
    choices.length === 1 ||
    (cards.scope && [TargetScope.SELF, TargetScope.TOP_OF_DECK].includes(cards.scope))
  ) {
    resolverAction.instanceId = choices[0];
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
      resolverAction.resources = extractResources(resources);
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
function extractResources(raw: NonNullable<Action['resources']>): Resources {
  const { choice: _choice, cards: _cards, ...rest } = raw;
  return rest as Resources;
}
