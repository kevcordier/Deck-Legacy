import { GameCard } from '@components/GameCard/GameCard';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { useGame } from '@hooks/useGame';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useWebKeyDown } from '@hooks/useWebKeyDown';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CARD_ASPECT_RATIO = 3 / 5;
const MAX_CARD_WIDTH = 384;
/** Desktop: position line under the card and margins (px). */
const DESKTOP_CHROME_HEIGHT = 60;
/** Desktop: margins plus the previous / next buttons beside the card (px). */
const DESKTOP_CHROME_WIDTH = 130;
/** Phone: navigation row (buttons and position) under the card and margins (px). */
const PHONE_CHROME_HEIGHT = 90;
/** Phone: side margins only, the buttons are under the card (px). */
const PHONE_CHROME_WIDTH = 16;

/** Largest card width whose full height fits in the modal (mirrors the Modal max sizes). */
export function useViewerCardWidth(): number {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktop();
  const maxModalHeight = height * (isDesktop ? 0.8 : 0.9) - insets.top - insets.bottom;
  const availableHeight =
    maxModalHeight - (isDesktop ? DESKTOP_CHROME_HEIGHT : PHONE_CHROME_HEIGHT);
  const availableWidth = width * 0.95 - (isDesktop ? DESKTOP_CHROME_WIDTH : PHONE_CHROME_WIDTH);
  return Math.max(
    0,
    Math.floor(Math.min(MAX_CARD_WIDTH, availableWidth, availableHeight * CARD_ASPECT_RATIO)),
  );
}

type CardViewerModalProps = {
  readonly cardIds: number[];
  readonly initialId: number;
  readonly onClose: () => void;
};

export function CardViewerModal({ cardIds, initialId, onClose }: CardViewerModalProps) {
  const { gameState } = useGame();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const [currentId, setCurrentId] = useState(initialId);
  const cardWidth = useViewerCardWidth();

  const currentIndex = cardIds.indexOf(currentId);
  const hasNav = cardIds.length > 1;
  // The card shown may have left the row meanwhile: it has no neighbour any more.
  const canNavigate = currentIndex !== -1;

  /** Previous (-1) or next (1) card; the row wraps around in both directions. */
  const step = useCallback(
    (delta: number) => {
      if (!canNavigate) return;
      setCurrentId(cardIds[(currentIndex + delta + cardIds.length) % cardIds.length]);
    },
    [canNavigate, cardIds, currentIndex],
  );
  const goPrev = useCallback(() => step(-1), [step]);
  const goNext = useCallback(() => step(1), [step]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    },
    [goNext, goPrev],
  );
  useWebKeyDown(handleKey);

  const instance = gameState.instances[currentId];
  if (!instance) return null;

  const isOnBoard = gameState.board.includes(currentId) || gameState.permanents.includes(currentId);

  const navButtonClass = `bg-background border-border size-11 shrink-0 items-center justify-center rounded-full border shadow-lg active:opacity-80 ${canNavigate ? '' : 'opacity-40'}`;

  const navButton = (direction: 'previous' | 'next') => (
    <Pressable
      onPress={direction === 'previous' ? goPrev : goNext}
      disabled={!canNavigate}
      accessibilityRole="button"
      accessibilityLabel={t(`cardViewer.${direction}`)}
      className={navButtonClass}
    >
      <Text className="font-display text-ink text-3xl leading-none">
        {direction === 'previous' ? '‹' : '›'}
      </Text>
    </Pressable>
  );

  const position = hasNav && (
    <Text className="text-sm text-white">
      {t('cardViewer.position', { index: currentIndex + 1, total: cardIds.length })}
    </Text>
  );

  const card = (
    <View className="rounded-xl shadow-2xl" style={{ width: cardWidth }}>
      {/* Selecting an action closes the viewer so the result is visible on the board. */}
      <GameCard
        instance={instance}
        unconstrained
        size="lg"
        isOnBoard={isOnBoard}
        onActionTriggered={onClose}
      />
    </View>
  );

  // Phone: the buttons go under the card, around the position, so the card keeps the full width.
  if (!isDesktop) {
    return (
      <Modal onClose={onClose} label="card-viewer" bare>
        {card}
        {hasNav && (
          <View className="flex-row items-center gap-4">
            {navButton('previous')}
            {position}
            {navButton('next')}
          </View>
        )}
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} label="card-viewer" bare>
      <View className="flex-row items-center justify-center gap-4">
        {hasNav && navButton('previous')}
        {card}
        {hasNav && navButton('next')}
      </View>
      {position}
    </Modal>
  );
}
