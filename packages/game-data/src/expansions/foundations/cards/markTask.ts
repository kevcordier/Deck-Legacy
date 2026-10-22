import { ActionEffectType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardAction } from '@deck-legacy/engine/domain/types';

/** Mark 1 task square of this side, paying its cost. */
export const markTask = (id: string, stepIds: number[], endsTurn = false): CardAction => ({
  id,
  ...(endsTurn ? { endsTurn } : { unlimited: true }),
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.TRACK_ADVANCE,
      cards: { scope: [TargetScope.SELF] },
      steps: { pickNumber: 1, ids: stepIds },
    },
  ],
});
