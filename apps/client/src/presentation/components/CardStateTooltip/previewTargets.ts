import { selfUpgradeStateId } from './selfUpgradeStateId';
import { ActionEffectType } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';

export interface PreviewTarget {
  readonly instanceId: number;
  /** State to show (defaults to the card's current state). */
  readonly stateId?: number;
}

/** Cards an action or track step can preview: its self-upgrade target, then the cards it discovers. */
export function previewTargets(
  instanceId: number,
  effects: readonly ActionEffect[] = [],
): PreviewTarget[] {
  const upgradeTo = selfUpgradeStateId(effects);
  const discovered = effects
    .filter(effect => effect.type === ActionEffectType.DISCOVER_CARD)
    .flatMap(effect => effect.cards?.ids ?? [])
    .map(id => ({ instanceId: id }));
  return upgradeTo === undefined ? discovered : [{ instanceId, stateId: upgradeTo }, ...discovered];
}
