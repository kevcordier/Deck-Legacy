import { CardNumber } from '@components/CardNumber/CardNumber';
import { Tooltip } from '@components/ui/Tooltip/Tooltip';
import { ActionEffectType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardInstance } from '@deck-legacy/engine/domain/types';
import { useGame } from '@hooks/useGame';
import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

const CARD_WIDTH = 240;

/** Target state of a self upgrade with an explicit state (the only upgrade effect that can be previewed). */
export function selfUpgradeStateId(effects: readonly ActionEffect[] = []): number | undefined {
  return effects.find(
    effect =>
      effect.type === ActionEffectType.UPGRADE_CARD &&
      effect.cards?.scope?.includes(TargetScope.SELF),
  )?.states?.ids?.[0];
}

interface CardStateTooltipProps {
  readonly instanceId: number;
  /** State to show (defaults to the card's current state). */
  readonly stateId?: number;
  readonly children: ReactNode;
  /** Also opens on a touch tap; turn off inside a button, where a tap must keep its action. */
  readonly openOnTap?: boolean;
  /** Keeps the action of a surrounding button when the preview covers the trigger. */
  readonly onTriggerPress?: () => void;
  /** Injected by the caller to avoid a GameCard <-> CardStateTooltip import cycle. */
  readonly renderCard: (instance: CardInstance) => ReactNode;
}

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

/** Shows a card in a given state on hover (web) or tap (touch), e.g. the target of an upgrade. */
export function CardStateTooltip({
  instanceId,
  stateId,
  children,
  openOnTap = true,
  onTriggerPress,
  renderCard,
}: CardStateTooltipProps) {
  const { t } = useTranslation();
  const { gameState } = useGame();
  const instance = gameState.instances[instanceId];
  if (!instance) return <>{children}</>;

  const preview: CardInstance =
    stateId === undefined || stateId === instance.stateId
      ? instance
      : { ...instance, stateId, trackProgress: [] };

  return (
    <Tooltip
      openOn={openOnTap ? 'hoverOrTap' : 'hover'}
      bare
      onTriggerPress={onTriggerPress}
      maxWidth={CARD_WIDTH}
      accessibilityLabel={t('card.previewState')}
      content={<View style={{ width: CARD_WIDTH }}>{renderCard(preview)}</View>}
    >
      {children}
    </Tooltip>
  );
}
