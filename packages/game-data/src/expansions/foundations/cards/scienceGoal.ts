import { Trigger } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardAction } from '@deck-legacy/engine/domain/types';

/** A goal of a science track: between rounds, once its total is reached, its effect, once. */
export function scienceGoal(id: string, total: number, effects: ActionEffect[]): CardAction {
  return {
    id,
    trigger: Trigger.END_OF_ROUND,
    optional: true,
    limitedTime: 1,
    condition: { type: 'accumulation', min: total },
    actionEffects: effects,
  };
}
