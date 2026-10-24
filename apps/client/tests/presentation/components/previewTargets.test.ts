import { previewTargets } from '@components/CardStateTooltip/previewTargets';
import { ActionEffectType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';
import { describe, expect, it } from 'vitest';

const upgradeSelf: ActionEffect = {
  id: 1,
  type: ActionEffectType.UPGRADE_CARD,
  cards: { scope: [TargetScope.SELF] },
  states: { ids: [3] },
};
const discover = (ids: number[]): ActionEffect => ({
  id: 2,
  type: ActionEffectType.DISCOVER_CARD,
  cards: { ids },
});

describe('previewTargets', () => {
  it('has nothing to preview without effects', () => {
    expect(previewTargets(7)).toEqual([]);
  });

  it('previews the self-upgrade target state', () => {
    expect(previewTargets(7, [upgradeSelf])).toEqual([{ instanceId: 7, stateId: 3 }]);
  });

  it('previews every discovered card', () => {
    expect(previewTargets(7, [discover([31, 32])])).toEqual([
      { instanceId: 31 },
      { instanceId: 32 },
    ]);
  });

  it('puts the upgrade target before the discovered cards', () => {
    expect(previewTargets(7, [discover([31]), upgradeSelf])).toEqual([
      { instanceId: 7, stateId: 3 },
      { instanceId: 31 },
    ]);
  });
});
