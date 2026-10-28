import { canAffordCost } from '../cards/canAffordCost';
import { getActiveState } from '../cards/selection/getActiveState';
import { PendingChoiceType } from '../enums';
import type {
  ActionEffect,
  CardDef,
  GameState,
  PendingChoice,
  ResolvedActionEffect,
  Sticker,
} from '../types';
import { getPickNumbers } from './getPickNumbers';

/** The pending choice fields that stay the same whatever is asked (id, action, source…). */
type ChoiceTemplate = Omit<
  PendingChoice,
  'type' | 'choices' | 'pickMin' | 'pickMax' | 'targetInstanceId'
>;

/**
 * Marks steps on the track of `targetId`: the next ones of an ordered track (their effects are
 * added), or a step choice for a track marked in any order.
 */
export function advanceTrackOf(
  resolverAction: ResolvedActionEffect,
  targetId: number,
  steps: NonNullable<ActionEffect['steps']>,
  template: ChoiceTemplate,
  gameState: GameState,
  defs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): [ResolvedActionEffect, PendingChoice[]] {
  const targetInst = gameState.instances[targetId];
  const track = getActiveState(targetInst, defs).track;
  if (!track) return [resolverAction, []];

  const availableSteps = track.steps.filter(s => !targetInst.trackProgress.includes(s.id));
  if (availableSteps.length === 0) return [resolverAction, []];

  const resolved: ResolvedActionEffect = { ...resolverAction, instanceIds: [targetId] };

  if (track.inOrder) {
    const sortedSteps = availableSteps
      .filter(s => !steps.ids || steps.ids.includes(s.id))
      .sort((a, b) => a.id - b.id);
    resolved.stepIds = sortedSteps.slice(0, steps.pickNumber ?? 1).map(s => s.id);
    // Another card's step: its effects resolve for that card ("this" is the marked card).
    const forTarget =
      targetId === resolverAction.sourceInstanceId ? {} : { sourceInstanceId: targetId };
    resolved.newActionEffects = resolved.stepIds.flatMap(stepId =>
      (track.steps.find(s => s.id === stepId)?.effects ?? []).map(e => ({
        ...e,
        sourceStepId: stepId,
        ...forTarget,
      })),
    );
    return [resolved, []];
  }

  const choices = availableSteps
    .filter(
      s =>
        (!steps.ids || steps.ids.includes(s.id)) &&
        // A step marked without paying it is offered even when its cost is out of reach.
        (resolverAction.payingCost === false ||
          canAffordCost(s.cost, template.sourceInstanceId, gameState, defs, stickerDefs)),
    )
    .map(s => s.id);

  return [
    resolved,
    [
      {
        ...template,
        type: PendingChoiceType.CHOOSE_STEP,
        targetInstanceId: targetId,
        choices,
        ...getPickNumbers(steps, choices.length),
      },
    ],
  ];
}
