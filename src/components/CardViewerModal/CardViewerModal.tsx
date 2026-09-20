import { GameCard } from '@components/GameCard/GameCard';
import { Modal } from '@components/ui/Modal/Modal';
import { useGame } from '@hooks/useGame';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type CardViewerModalProps = {
  readonly cardIds: number[];
  readonly initialId: number;
  readonly onClose: () => void;
};

export function CardViewerModal({ cardIds, initialId, onClose }: CardViewerModalProps) {
  const { gameState } = useGame();
  const { t } = useTranslation();
  const [currentId, setCurrentId] = useState(initialId);

  const currentIndex = cardIds.indexOf(currentId);
  const hasNav = cardIds.length > 1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex !== -1;

  const goPrev = () => {
    if (canGoPrev) setCurrentId(cardIds[currentIndex - 1]);
  };
  const goNext = () => {
    if (canGoNext) setCurrentId(cardIds[(currentIndex + 1) % cardIds.length]);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentId(cardIds[currentIndex - 1]);
      } else if (e.key === 'ArrowRight' && currentIndex !== -1) {
        setCurrentId(cardIds[(currentIndex + 1) % cardIds.length]);
      }
    };
    globalThis.addEventListener('keydown', handleKey);
    return () => globalThis.removeEventListener('keydown', handleKey);
  }, [currentIndex, cardIds]);

  const instance = gameState.instances[currentId];
  if (!instance) return null;

  const isOnBoard = gameState.board.includes(currentId) || gameState.permanents.includes(currentId);

  const closeOnActionSelected = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      target.closest(
        '[data-tour="card-production"] button, [data-tour^="card-action"], [data-tour="card-upgrade"]',
      )
    ) {
      onClose();
    }
  };

  return (
    <Modal
      onClose={onClose}
      label="card-viewer"
      subtitle={
        hasNav ? t('cardViewer.position', { index: currentIndex + 1, total: cardIds.length }) : null
      }
    >
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {hasNav && (
          <button
            type="button"
            onClick={goPrev}
            disabled={!canGoPrev}
            aria-label={t('cardViewer.previous')}
            className="font-display shrink-0 cursor-pointer text-3xl leading-none text-ink/60 hover:text-ink disabled:pointer-events-none disabled:opacity-20"
          >
            ‹
          </button>
        )}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- delegates bubbled clicks from the card's own keyboard-accessible action buttons; not itself interactive */}
        <div className="w-72 sm:w-80 md:w-96" onClick={closeOnActionSelected}>
          <GameCard instance={instance} className="max-w-none!" size="lg" isOnBoard={isOnBoard} />
        </div>
        {hasNav && (
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            aria-label={t('cardViewer.next')}
            className="font-display shrink-0 cursor-pointer text-3xl leading-none text-ink/60 hover:text-ink disabled:pointer-events-none disabled:opacity-20"
          >
            ›
          </button>
        )}
      </div>
    </Modal>
  );
}
