import type { GameState, PendingChoice, ResolvedActionEffect } from '../types';
import type { PlayerChoiceStrategy } from './PlayerChoiceStrategy';

/** The order the player gave the cards, and the one they destroy (Performance). */
export class OrderChoiceStrategy implements PlayerChoiceStrategy {
  apply(
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    _gs: GameState,
    pendingChoices: PendingChoice[],
  ): [ResolvedActionEffect, PendingChoice[]] {
    return [
      {
        ...resolvedAction,
        instanceIds: choice.instanceIds ?? [],
        destroyedIds: choice.destroyedIds ?? [],
      },
      pendingChoices.slice(1),
    ];
  }
}
