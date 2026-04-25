import type { GameState, PendingChoice, ResolvedActionEffect } from '@engine/domain/types';

export interface PlayerChoiceStrategy {
  apply(
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    gs: GameState,
    pendingChoices: PendingChoice[],
  ): [ResolvedActionEffect, PendingChoice[]];
}
