import { getActiveState } from '../cards/selection/getActiveState';
import type { CardDef, GameState, PendingChoice, ResolvedActionEffect } from '../types';
import type { PlayerChoiceStrategy } from './PlayerChoiceStrategy';

export class StepChoiceStrategy implements PlayerChoiceStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  apply(
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    gs: GameState,
    pendingChoices: PendingChoice[],
  ): [ResolvedActionEffect, PendingChoice[]] {
    if (!choice.stepIds) {
      return [resolvedAction, pendingChoices.slice(1)];
    }

    // The marked card: another card's track when the effect targets one (Mass Export).
    const targetId = resolvedAction.instanceIds?.[0] ?? choice.sourceInstanceId;
    const sourceState = getActiveState(gs.instances[targetId], this.cardDefs);
    const newActionEffects = choice.stepIds.flatMap(stepId => {
      return (sourceState?.track?.steps.find(s => s.id === stepId)?.effects ?? []).map(e => ({
        ...e,
        sourceStepId: stepId,
        // Another card's step: its effects resolve for that card ("this" is the marked card).
        ...(targetId === choice.sourceInstanceId ? {} : { sourceInstanceId: targetId }),
      }));
    });

    const mergedResolvedAction: ResolvedActionEffect = {
      ...resolvedAction,
      stepIds: choice.stepIds,
      // After the effects already queued (the other cards to mark, Mass Export).
      newActionEffects: [...(resolvedAction.newActionEffects ?? []), ...newActionEffects],
    };

    return [mergedResolvedAction, pendingChoices.slice(1)];
  }
}
