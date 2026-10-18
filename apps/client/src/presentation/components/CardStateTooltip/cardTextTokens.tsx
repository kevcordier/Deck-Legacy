import { CardStateTooltip } from './CardStateTooltip';
import { upgradeIconTooltip } from './upgradeIconTooltip';
import { CardNumber } from '@components/CardNumber/CardNumber';
import { ActionEffectType } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardInstance } from '@deck-legacy/engine/domain/types';
import { Fragment, type ReactNode } from 'react';

/**
 * `wrapIcon` for card texts: {{discovered}} shows the number of the cards discovered by `effects`
 * (previewed on hover when `renderCard` is given), and {{upgrade}} previews the upgrade target.
 */
export function cardTextTokens(
  instanceId: number,
  effects: readonly ActionEffect[] | undefined,
  renderCard?: (instance: CardInstance) => ReactNode,
  openOnTap = true,
) {
  const upgrade = renderCard && upgradeIconTooltip(instanceId, effects, renderCard, openOnTap);
  const discoveredIds = (effects ?? [])
    .filter(effect => effect.type === ActionEffectType.DISCOVER_CARD)
    .flatMap(effect => effect.cards?.ids ?? []);
  const discovered = (
    <>
      {discoveredIds.map((id, index) => (
        <Fragment key={id}>
          {index > 0 && '/'}
          {renderCard ? (
            <CardStateTooltip instanceId={id} renderCard={renderCard} openOnTap={openOnTap}>
              <CardNumber instanceId={id} />
            </CardStateTooltip>
          ) : (
            <CardNumber instanceId={id} />
          )}
        </Fragment>
      ))}
    </>
  );
  return (key: string, icon: ReactNode): ReactNode =>
    key === 'discovered' ? discovered : (upgrade?.(key, icon) ?? icon);
}
