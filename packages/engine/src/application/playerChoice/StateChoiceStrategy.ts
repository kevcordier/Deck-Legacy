import type { GameState, PendingChoice, ResolvedActionEffect } from '../../domain/types';
import type { PlayerChoiceStrategy } from './PlayerChoiceStrategy';

export class StateChoiceStrategy implements PlayerChoiceStrategy {
  apply(
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    _gs: GameState,
    pendingChoices: PendingChoice[],
  ): [ResolvedActionEffect, PendingChoice[]] {
    const mergedResolvedAction: ResolvedActionEffect = {
      ...resolvedAction,
      stateId: choice.stateId,
    };

    return [mergedResolvedAction, pendingChoices.slice(1)];
  }
}
