import { cardSelector } from '@engine/application/cardSelector';
import { ActionType, PendingChoiceType, ResourceType, TargetScope } from '@engine/domain/enums';
import type {
  Action,
  CardDef,
  GameState,
  PendingChoice,
  ResolvedAction,
  Resources,
} from '@engine/domain/types';

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
  const pendingChoice: PendingChoice[] = [];

  if (action.type === ActionType.ADD_BOARD_EFFECT) {
    return resolveBoardEffect(
      action,
      instanceId,
      gameState,
      defs,
      isMandatory,
      resolverAction,
      pendingChoice,
    );
  }

  if (action.type === ActionType.BOOST_CARD) {
    action.cards = { ...action.cards, produces: Object.values(ResourceType) };
  }

  if (action.cards) {
    resolveCardTarget(
      action,
      instanceId,
      gameState,
      defs,
      isMandatory,
      resolverAction,
      pendingChoice,
    );
  }

  if (action.resources) {
    resolveResourceTarget(
      action,
      instanceId,
      gameState,
      defs,
      isMandatory,
      resolverAction,
      pendingChoice,
    );
  }

  if (action.stickerIds) {
    resolveStickerTarget(action, instanceId, isMandatory, resolverAction, pendingChoice);
  }

  if (action.states) {
    resolveStateTarget(action, instanceId, isMandatory, resolverAction, pendingChoice);
  }

  return [resolverAction, pendingChoice];
}

function resolveBoardEffect(
  action: Action,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef> | undefined,
  isMandatory: boolean,
  resolverAction: ResolvedAction,
  pendingChoice: PendingChoice[],
): [ResolvedAction, PendingChoice[]] {
  if (action.cards) {
    const instanceIds = cardSelector(action.cards, instanceId, gameState, defs);
    if (instanceIds.length > 1) {
      pendingChoice.push({
        id: `${instanceId}-${action.id}`,
        kind: action.type,
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
  if (action.effect) {
    resolverAction.effect = action.effect;
  }
  return [resolverAction, pendingChoice];
}

function resolveCardTarget(
  action: Action,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef> | undefined,
  isMandatory: boolean,
  resolverAction: ResolvedAction,
  pendingChoice: PendingChoice[],
): void {
  if (!action.cards) return;
  if (action.cards.ids?.length === 1) {
    resolverAction.instanceId = action.cards.ids[0];
    return;
  }
  const choices = cardSelector(action.cards, instanceId, gameState, defs);
  if (choices.length === 0) {
    resolverAction.instanceId = undefined;
    return;
  }
  if (
    choices.length === 1 ||
    (action.cards.scope && [TargetScope.SELF, TargetScope.TOP_OF_DECK].includes(action.cards.scope))
  ) {
    resolverAction.instanceId = choices[0];
    return;
  }
  pendingChoice.push({
    id: `${instanceId}-${action.id}`,
    kind: action.type,
    type: PendingChoiceType.CHOOSE_CARD,
    sourceInstanceId: instanceId,
    choices,
    pickCount: action.cards.number ?? 1,
    isMandatory,
  });
}

function resolveResourceTarget(
  action: Action,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef> | undefined,
  isMandatory: boolean,
  resolverAction: ResolvedAction,
  pendingChoice: PendingChoice[],
): void {
  if (!action.resources) return;
  if (action.resources.choice && action.resources.choice.length > 1) {
    pendingChoice.push({
      id: `${instanceId}-${action.id}`,
      kind: action.type,
      type: PendingChoiceType.CHOOSE_RESOURCE,
      sourceInstanceId: instanceId,
      choices: action.resources.choice as Resources[],
      pickCount: 1,
      isMandatory,
    });
    return;
  }
  if (action.resources.cards) {
    const choices = cardSelector(action.resources.cards, instanceId, gameState, defs);
    if (choices.length === 0) {
      resolverAction.resources = {};
    } else if (choices.length === 1) {
      resolverAction.resources = extractResources(action.resources);
    } else {
      pendingChoice.push({
        id: `${instanceId}-${action.id}`,
        kind: action.type,
        type: PendingChoiceType.CHOOSE_CARD,
        sourceInstanceId: instanceId,
        choices,
        pickCount: action.resources.cards.number ?? 1,
        isMandatory,
      });
    }
    return;
  }
  resolverAction.resources = extractResources(action.resources);
}

function resolveStickerTarget(
  action: Action,
  instanceId: number,
  isMandatory: boolean,
  resolverAction: ResolvedAction,
  pendingChoice: PendingChoice[],
): void {
  if (!action.stickerIds) return;
  if (action.stickerIds.length === 1) {
    resolverAction.stickerId = action.stickerIds[0];
    return;
  }
  pendingChoice.push({
    id: `${instanceId}-${action.id}`,
    kind: action.type,
    type: PendingChoiceType.CHOOSE_STICKER,
    sourceInstanceId: instanceId,
    choices: action.stickerIds,
    pickCount: 1,
    isMandatory,
  });
}

function resolveStateTarget(
  action: Action,
  instanceId: number,
  isMandatory: boolean,
  resolverAction: ResolvedAction,
  pendingChoice: PendingChoice[],
): void {
  if (!action.states) return;
  if (action.states.length === 1) {
    resolverAction.stateId = action.states[0];
    return;
  }
  pendingChoice.push({
    id: `${instanceId}-${action.id}`,
    kind: action.type,
    type: PendingChoiceType.CHOOSE_STATE,
    sourceInstanceId: instanceId,
    choices: action.states,
    pickCount: 1,
    isMandatory,
  });
}

/** Strips the `choice` and `cards` sub-fields from Action.resources to get plain Resources. */
function extractResources(raw: NonNullable<Action['resources']>): Resources {
  const { choice: _choice, cards: _cards, ...rest } = raw;
  return rest as Resources;
}
