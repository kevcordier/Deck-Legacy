import { ActionEffectType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';

/** Target state of a self upgrade with an explicit state (the only upgrade effect that can be previewed). */
export function selfUpgradeStateId(effects: readonly ActionEffect[] = []): number | undefined {
  return effects.find(
    effect =>
      effect.type === ActionEffectType.UPGRADE_CARD &&
      effect.cards?.scope?.includes(TargetScope.SELF),
  )?.states?.ids?.[0];
}
