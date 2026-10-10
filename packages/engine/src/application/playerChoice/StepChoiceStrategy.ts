import type { CardDef, GameState, PendingChoice, ResolvedActionEffect } from '../../domain/types';
import { getActiveState } from '../cardHelpers';
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

    const sourceState = getActiveState(gs.instances[choice.sourceInstanceId], this.cardDefs);
    const newActionEffects = choice.stepIds.flatMap(stepId => {
      return (sourceState?.track?.steps.find(s => s.id === stepId)?.effects ?? []).map(e => ({
        ...e,
        sourceStepId: stepId,
      }));
    });

    const mergedResolvedAction: ResolvedActionEffect = {
      ...resolvedAction,
      stepIds: choice.stepIds,
      newActionEffects,
    };

    return [mergedResolvedAction, pendingChoices.slice(1)];
  }
}
