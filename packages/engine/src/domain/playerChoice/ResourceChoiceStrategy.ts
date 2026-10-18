import { mergeResources } from '../gameStateHelper';
import type { GameState, PendingChoice, ResolvedActionEffect } from '../types';
import type { PlayerChoiceStrategy } from './PlayerChoiceStrategy';

export class ResourceChoiceStrategy implements PlayerChoiceStrategy {
  apply(
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    _gs: GameState,
    pendingChoices: PendingChoice[],
  ): [ResolvedActionEffect, PendingChoice[]] {
    const mergedResolvedAction: ResolvedActionEffect = {
      ...resolvedAction,
      resources:
        resolvedAction.resources || choice.resources
          ? mergeResources(resolvedAction.resources ?? {}, choice.resources ?? {})
          : undefined,
    };

    return [mergedResolvedAction, pendingChoices.slice(1)];
  }
}
