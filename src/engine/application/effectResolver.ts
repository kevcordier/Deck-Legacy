import { cardSelector } from '@engine/application/cardSelector';
import { PendingChoiceType } from '@engine/domain/enums';
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
  gameState?: GameState,
  defs?: Record<number, CardDef>,
  isMandatory = false,
): [ResolvedAction, PendingChoice[]] {
  const resolverAction: ResolvedAction = {
    id: `${instanceId}-${action.id}`,
    type: action.type,
    sourceInstanceId: instanceId,
  };
  const pendingChoice: PendingChoice[] = [];
  if (action.cards) {
    if (action.cards.ids?.length === 1) {
      resolverAction.instanceId = action.cards.ids[0];
    } else {
      const choices = gameState ? cardSelector(action.cards, instanceId, gameState, defs) : [];

      if (choices.length === 0) {
        resolverAction.instanceId = undefined;
      } else if (choices.length === 1) {
        resolverAction.instanceId = choices[0];
      } else {
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
    }
  }

  if (action.resources) {
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
    } else if (action.resources.cards) {
      const choices = gameState
        ? cardSelector(action.resources.cards, instanceId, gameState, defs)
        : [];
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
    } else {
      resolverAction.resources = extractResources(action.resources);
    }
  }

  if (action.stickerId) {
    if (action.stickerId === 'boost' && action.cards) {
      // choose a production from a card to add with a sticker
    } else if (typeof action.stickerId === 'number') {
      resolverAction.stickerId = action.stickerId;
    }
  }

  if (action.states) {
    if (action.states.length === 1) {
      resolverAction.stateId = action.states[0];
    } else {
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
  }

  if (action.resource_per_card) {
    // calcule the total resources to add based on the number of cards matching the selector
  }

  return [resolverAction, pendingChoice];
}

/** Strips the `choice` and `cards` sub-fields from Action.resources to get plain Resources. */
function extractResources(raw: NonNullable<Action['resources']>): Resources {
  const { choice: _choice, cards: _cards, ...rest } = raw;
  return rest as Resources;
}
