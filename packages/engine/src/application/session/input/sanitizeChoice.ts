import { ActionEffectType, PendingChoiceType } from '../../../domain/enums';
import type { PendingChoice, ResolvedActionEffect } from '../../../domain/types';
import { isValidSelection } from './isValidSelection';
import { sameValue } from './sameValue';

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
    case PendingChoiceType.SPLIT_RESOURCES:
      return null; // a cost: paid with resolvePayCost (sanitizeCost)
  }
}
