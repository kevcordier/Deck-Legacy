import { useViewerCardWidth } from './useViewerCardWidth';
import { GameCard } from '@components/GameCard/GameCard';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { useGame } from '@hooks/useGame';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useWebKeyDown } from '@hooks/useWebKeyDown';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import {
  Directions,
  GestureDetector,
  GestureHandlerRootView,
  useCompetingGestures,
  useFlingGesture,
} from 'react-native-gesture-handler';

type CardViewerModalProps = {
  readonly cardIds: number[];
  readonly initialId: number;
  readonly onClose: () => void;
  /** Text shown above the card (e.g. "New card discovered"). */
  readonly title?: string;
};

/** The card shown is the tutorial target `viewer-card-<id>`, and its parts `card-number`… */
export function CardViewerModal({ cardIds, initialId, onClose, title }: CardViewerModalProps) {
  const { gameState } = useGame();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const [currentId, setCurrentId] = useState(initialId);
  const cardWidth = useViewerCardWidth(!!title);

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

  // Phone: swiping the card left shows the next one, right the previous one.
  const swipeLeft = useFlingGesture({
    direction: Directions.LEFT,
    runOnJS: true,
    onDeactivate: goNext,
  });
  const swipeRight = useFlingGesture({
    direction: Directions.RIGHT,
    runOnJS: true,
    onDeactivate: goPrev,
  });
  const swipe = useCompetingGestures(swipeLeft, swipeRight);

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

  const heading = title && (
    <Text className="text-card font-body-bold text-center uppercase">{title}</Text>
  );

  const card = (
    <TutorialTarget
      id={`viewer-card-${currentId}`}
      className="rounded-xl shadow-2xl"
      style={{ width: cardWidth }}
    >
      {/* Selecting an action closes the viewer so the result is visible on the board. */}
      <GameCard
        instance={instance}
        unconstrained
        size="lg"
        isOnBoard={isOnBoard}
        tourTarget
        editableName
        onActionTriggered={onClose}
      />
    </TutorialTarget>
  );

  // Phone: the buttons go under the card, around the position, so the card keeps the full width.
  if (!isDesktop) {
    return (
      <Modal onClose={onClose} label="card-viewer" bare>
        {heading}
        {hasNav ? (
          <GestureHandlerRootView>
            <GestureDetector gesture={swipe}>{card}</GestureDetector>
          </GestureHandlerRootView>
        ) : (
          card
        )}
        {hasNav && (
          <View className="w-full flex-row items-center gap-4">
            {/* The empty space beside the buttons closes the viewer, like the backdrop. */}
            <Pressable onPress={onClose} accessible={false} className="flex-1 self-stretch" />
            {navButton('previous')}
            {position}
            {navButton('next')}
            <Pressable onPress={onClose} accessible={false} className="flex-1 self-stretch" />
          </View>
        )}
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} label="card-viewer" bare>
      {heading}
      <View className="flex-row items-center justify-center gap-4">
        {hasNav && navButton('previous')}
        {card}
        {hasNav && navButton('next')}
      </View>
      {position}
    </Modal>
  );
}
