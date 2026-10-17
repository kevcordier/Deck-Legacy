import { ActionEffectType, PendingChoiceType, Phase } from '../../domain/enums';
import type {
  GameCommand,
  GameState,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
} from '../../domain/types';

/**
 * Checks of the player input (EDR-051). The server runs the recorded commands again, so a
 * command the engine accepts is a legal move: these checks refuse what the UI never sends.
 */

/** Phases in which the UI offers each turn flow command (`GamePhaseActions`). */
export function isFlowCommandAllowed(command: GameCommand, state: GameState): boolean {
  switch (command.type) {
    case 'startRound':
      return state.phase === Phase.ROUND_END && !state.isLastRound;
    case 'endRound':
      return (
        (state.phase === Phase.TURN_END && state.drawPile.length === 0) ||
        (state.phase === Phase.ROUND_END && state.isLastRound)
      );
    case 'startTurn':
      return state.phase === Phase.ROUND_START || state.phase === Phase.TURN_END;
    case 'progress':
    case 'endTurn':
      return state.phase === Phase.PLAYING;
    case 'selectExpansion':
      return state.phase === Phase.EXPANSION_CHOICE;
    default:
      return true;
  }
}

export function isInPlay(state: GameState, instanceId: number): boolean {
  return state.board.includes(instanceId) || state.permanents.includes(instanceId);
}

/** Same value whatever the key order. */
function sameValue(a: unknown, b: unknown): boolean {
  return stableJson(a) === stableJson(b);
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([x], [y]) => (x < y ? -1 : 1)))
      : item,
  );
}

/**
 * Selected values must be distinct offered choices. Card choices list a card once per unit it
 * counts for (`COUNT_AS_2`); the count must reach the minimum (or every offered unit) and stay
 * within the maximum, as the UI requires.
 */
function isValidSelection(selected: unknown[] | undefined, pending: PendingChoice): boolean {
  if (new Set(selected?.map(stableJson)).size !== selected?.length) return false;
  const units = (value: unknown) =>
    pending.choices.filter(choice => sameValue(choice, value)).length;
  if (selected.some(value => units(value) === 0)) return false;
  const count = selected.reduce<number>((total, value) => total + units(value), 0);
  return (
    count >= Math.min(pending.pickMin, pending.choices.length) && selected.length <= pending.pickMax
  );
}

/**
 * The choice the engine resolves, rebuilt from the pending choice and the player's selection
 * only; `null` when the selection is not one the pending choice offers.
 */
export function sanitizeChoice(
  choice: ResolvedActionEffect,
  choiceType: PendingChoiceType,
  pending: PendingChoice | undefined,
): ResolvedActionEffect | null {
  if (pending?.type !== choiceType || pending.kind === ActionEffectType.COST) return null;
  const base = { id: pending.id, type: pending.kind, sourceInstanceId: pending.sourceInstanceId };
  switch (choiceType) {
    case PendingChoiceType.CHOOSE_CARD:
      return isValidSelection(choice.instanceIds, pending)
        ? { ...base, instanceIds: choice.instanceIds }
        : null;
    case PendingChoiceType.CHOOSE_STEP:
      return isValidSelection(choice.stepIds, pending)
        ? { ...base, stepIds: choice.stepIds }
        : null;
    case PendingChoiceType.CHOOSE_STICKER:
      return isValidSelection(choice.stickerIds, pending)
        ? { ...base, stickerIds: choice.stickerIds }
        : null;
    case PendingChoiceType.CHOOSE_ACTION_EFFECT:
      return choice.newActionEffects?.length === 1 &&
        pending.choices.some(effect => sameValue(effect, choice.newActionEffects?.[0]))
        ? { ...base, newActionEffects: choice.newActionEffects }
        : null;
    case PendingChoiceType.CHOOSE_RESOURCE:
      return pending.choices.some(resources => sameValue(resources, choice.resources))
        ? { ...base, resources: choice.resources }
        : null;
    case PendingChoiceType.CHOOSE_STATE:
      return pending.choices.includes(choice.stateId ?? -1)
        ? { ...base, stateId: choice.stateId }
        : null;
  }
}

/** A cost payment: one offered resource option, or offered cards to discard (or destroy). */
export function sanitizeCost(
  resolved: ResolvedCost,
  pending: PendingChoice | undefined,
): ResolvedCost | null {
  if (pending?.kind !== ActionEffectType.COST) return null;
  if (pending.type === PendingChoiceType.CHOOSE_RESOURCE) {
    const offered = pending.choices.some(resources => sameValue(resources, resolved.resources));
    return offered
      ? { resources: resolved.resources, discardedCardIds: [], destroyedCardIds: [] }
      : null;
  }
  if (pending.type !== PendingChoiceType.CHOOSE_CARD) return null;
  // Same rule as the UI (`buildCardCostResolution`): the choice id names a destroy cost.
  const destroy = pending.id.includes('-destroy');
  const cards = destroy ? resolved.destroyedCardIds : resolved.discardedCardIds;
  const others = destroy ? resolved.discardedCardIds : resolved.destroyedCardIds;
  if (others.length > 0 || Object.keys(resolved.resources).length > 0) return null;
  if (!isValidSelection(cards, pending)) return null;
  return {
    resources: {},
    discardedCardIds: destroy ? [] : cards,
    destroyedCardIds: destroy ? cards : [],
  };
}
