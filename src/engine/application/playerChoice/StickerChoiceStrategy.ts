import type { PlayerChoiceStrategy } from '@engine/application/playerChoice/PlayerChoiceStrategy';
import type { GameState, PendingChoice, ResolvedActionEffect } from '@engine/domain/types';

export class StickerChoiceStrategy implements PlayerChoiceStrategy {
  apply(
    choice: ResolvedActionEffect,
    resolvedAction: ResolvedActionEffect,
    _gs: GameState,
    pendingChoices: PendingChoice[],
  ): [ResolvedActionEffect, PendingChoice[]] {
    const mergedResolvedAction: ResolvedActionEffect = {
      ...resolvedAction,
      stickerId: choice.stickerId,
    };

    return [mergedResolvedAction, pendingChoices.slice(1)];
  }
}
