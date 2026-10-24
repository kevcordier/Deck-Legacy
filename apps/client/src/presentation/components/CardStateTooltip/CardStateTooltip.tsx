import type { PreviewTarget } from './previewTargets';
import { Tooltip } from '@components/ui/Tooltip/Tooltip';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { useGame } from '@hooks/useGame';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View, useWindowDimensions } from 'react-native';

const CARD_WIDTH = 240;
/** Card width when several cards are previewed side by side. */
const SMALL_CARD_WIDTH = 160;
const GAP = 8;
const SCREEN_MARGIN = 16;
const HOVER_DELAY_MS = 500;

interface CardStateTooltipProps {
  readonly targets: readonly PreviewTarget[];
  readonly children: ReactNode;
  /** Classes of the trigger wrapper. */
  readonly className?: string;
  /** Also opens on a touch tap; turn off inside a button, where a tap must keep its action. */
  readonly openOnTap?: boolean;
  /** Keeps the action of a surrounding button when the preview covers the trigger. */
  readonly onTriggerPress?: () => void;
  /** Injected by the caller to avoid a GameCard <-> CardStateTooltip import cycle. */
  readonly renderCard: (instance: CardInstance) => ReactNode;
}

/** Shows cards in given states on hover (web) or tap (touch), e.g. the target of an upgrade. */
export function CardStateTooltip({
  targets,
  children,
  className,
  openOnTap = true,
  onTriggerPress,
  renderCard,
}: CardStateTooltipProps) {
  const { t } = useTranslation();
  const { gameState } = useGame();
  const { width: windowWidth } = useWindowDimensions();
  const previews = targets.flatMap(({ instanceId, stateId }): CardInstance[] => {
    const instance = gameState.instances[instanceId];
    if (!instance) return [];
    return stateId === undefined || stateId === instance.stateId
      ? [instance]
      : [{ ...instance, stateId, trackProgress: [] }];
  });
  if (previews.length === 0) return <>{children}</>;

  const cardWidth = previews.length > 1 ? SMALL_CARD_WIDTH : CARD_WIDTH;
  const maxWidth = Math.min(previews.length * (cardWidth + GAP) - GAP, windowWidth - SCREEN_MARGIN);

  return (
    <Tooltip
      openOn={openOnTap ? 'hoverOrTap' : 'hover'}
      openDelay={HOVER_DELAY_MS}
      bare
      className={className}
      onTriggerPress={onTriggerPress}
      maxWidth={maxWidth}
      accessibilityLabel={t('card.previewState')}
      content={
        <View className="flex-row flex-wrap justify-center" style={{ gap: GAP, maxWidth }}>
          {previews.map(preview => (
            <View key={preview.id} style={{ width: cardWidth }}>
              {renderCard(preview)}
            </View>
          ))}
        </View>
      }
    >
      {children}
    </Tooltip>
  );
}
