import type { GameState, PendingChoice, ResolvedActionEffect } from '../types';
import type { PlayerChoiceStrategy } from './PlayerChoiceStrategy';

export class ChooseActionEffectStrategy implements PlayerChoiceStrategy {
  apply(
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    _gs: GameState,
    pendingChoices: PendingChoice[],
  ): [ResolvedActionEffect, PendingChoice[]] {
    const mergedResolvedAction: ResolvedActionEffect = {
      ...resolvedAction,
      newActionEffects: choice.newActionEffects,
    };

    return [mergedResolvedAction, pendingChoices.slice(1)];
  }
}
