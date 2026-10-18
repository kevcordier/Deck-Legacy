import type { GameState, PendingChoice, ResolvedActionEffect } from '../types';
import type { PlayerChoiceStrategy } from './PlayerChoiceStrategy';

export class StickerChoiceStrategy implements PlayerChoiceStrategy {
  apply(
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    _gs: GameState,
    pendingChoices: PendingChoice[],
  ): [ResolvedActionEffect, PendingChoice[]] {
    const mergedResolvedAction: ResolvedActionEffect = {
      ...resolvedAction,
      stickerIds: choice.stickerIds,
    };

    return [mergedResolvedAction, pendingChoices.slice(1)];
  }
}
