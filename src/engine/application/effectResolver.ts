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

  if (action.type === ActionType.ADD_BOARD_EFFECT && action.effect) {
    return resolveBoardEffect(
      action.id,
      action.type,
      action.effect,
      action.cards,
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
      action.id,
      action.type,
      action.cards,
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
      action.id,
      action.type,
      action.resources,
      instanceId,
      gameState,
      defs,
      isMandatory,
      resolverAction,
      pendingChoice,
    );
  }

  if (action.stickerIds) {
    resolveStickerTarget(
      action.id,
      action.type,
      action.stickerIds,
      instanceId,
      isMandatory,
      resolverAction,
      pendingChoice,
    );
  }

  if (action.states) {
    resolveStateTarget(
      action.id,
      action.type,
      action.states,
      instanceId,
      isMandatory,
      resolverAction,
      pendingChoice,
    );
  }

  return [resolverAction, pendingChoice];
}

function resolveBoardEffect(
  id: number,
  type: ActionType,
  effect: Passive,
  cards: CardeSelector | undefined,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef> | undefined,
  isMandatory: boolean,
  resolverAction: ResolvedAction,
  pendingChoice: PendingChoice[],
): [ResolvedAction, PendingChoice[]] {
  if (cards) {
    const instanceIds = cardSelector(cards, instanceId, gameState, defs);
    if (instanceIds.length > 1) {
      pendingChoice.push({
        id: `${instanceId}-${id}`,
        kind: type,
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

  return [resolverAction, pendingChoice];
}

function resolveCardTarget(
  id: number,
  type: ActionType,
  cards: CardeSelector,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef> | undefined,
  isMandatory: boolean,
  resolverAction: ResolvedAction,
  pendingChoice: PendingChoice[],
): void {
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
  pendingChoice.push({
    id: `${instanceId}-${id}`,
    kind: type,
    type: PendingChoiceType.CHOOSE_CARD,
    sourceInstanceId: instanceId,
    choices,
    pickCount: cards.number ?? 1,
    isMandatory,
  });
}

function resolveResourceTarget(
  id: number,
  type: ActionType,
  resources: ResourceSelector,
  instanceId: number,
  gameState: GameState,
  defs: Record<number, CardDef> | undefined,
  isMandatory: boolean,
  resolverAction: ResolvedAction,
  pendingChoice: PendingChoice[],
): void {
  if (resources.choice && resources.choice.length > 1) {
    pendingChoice.push({
      id: `${instanceId}-${id}`,
      kind: type,
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
      pendingChoice.push({
        id: `${instanceId}-${id}`,
        kind: type,
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

function resolveStickerTarget(
  id: number,
  type: ActionType,
  stickerIds: number[],
  instanceId: number,
  isMandatory: boolean,
  resolverAction: ResolvedAction,
  pendingChoice: PendingChoice[],
): void {
  if (stickerIds.length === 1) {
    resolverAction.stickerId = stickerIds[0];
    return;
  }
  pendingChoice.push({
    id: `${instanceId}-${id}`,
    kind: type,
    type: PendingChoiceType.CHOOSE_STICKER,
    sourceInstanceId: instanceId,
    choices: stickerIds,
    pickCount: 1,
    isMandatory,
  });
}

function resolveStateTarget(
  id: number,
  type: ActionType,
  states: number[],
  instanceId: number,
  isMandatory: boolean,
  resolverAction: ResolvedAction,
  pendingChoice: PendingChoice[],
): void {
  if (states.length === 1) {
    resolverAction.stateId = states[0];
    return;
  }
  pendingChoice.push({
    id: `${instanceId}-${id}`,
    kind: type,
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
