import { getActiveState } from '@engine/application/cardHelpers';
import type { PlayerChoiceStrategy } from '@engine/application/playerChoice/PlayerChoiceStrategy';
import type { CardDef, GameState, PendingChoice, ResolvedActionEffect } from '@engine/domain/types';

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
      return sourceState?.track?.steps.find(s => s.id === stepId)?.effects ?? [];
    });

    const mergedResolvedAction: ResolvedActionEffect = {
      ...resolvedAction,
      stepIds: choice.stepIds,
      newActionEffects,
    };

    return [mergedResolvedAction, pendingChoices.slice(1)];
  }
}
