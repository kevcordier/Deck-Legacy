import { Tooltip } from '@components/ui/Tooltip/Tooltip';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { useGame } from '@hooks/useGame';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

const CARD_WIDTH = 240;

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
