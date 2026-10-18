import { CardStateTooltip } from './CardStateTooltip';
import { selfUpgradeStateId } from './selfUpgradeStateId';
import type { ActionEffect, CardInstance } from '@deck-legacy/engine/domain/types';
import type { ReactNode } from 'react';

/**
 * `wrapIcon` for `renderTextWithIcons`: previews the upgrade target of `effects` on the {{upgrade}} icon.
 * Returns undefined when the effects have no previewable upgrade.
 */
export function upgradeIconTooltip(
  instanceId: number,
  effects: readonly ActionEffect[] | undefined,
  renderCard: (instance: CardInstance) => ReactNode,
  openOnTap = true,
) {
  const stateId = selfUpgradeStateId(effects);
  if (stateId === undefined) return undefined;
  return (key: string, icon: ReactNode) =>
    key === 'upgrade' ? (
      <CardStateTooltip
        instanceId={instanceId}
        stateId={stateId}
        renderCard={renderCard}
        openOnTap={openOnTap}
      >
        {icon}
      </CardStateTooltip>
    ) : (
      icon
    );
}
