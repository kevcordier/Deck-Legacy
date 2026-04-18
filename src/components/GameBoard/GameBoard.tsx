import { CardListModal } from '@components/CardListModal/CardListModal';
import { DeckViewer } from '@components/DeckViewer/DeckViewer';
import { GameCard } from '@components/GameCard/GameCard';
import { MainBoard } from '@components/MainBoard/MainBoard';
import { Button } from '@components/ui/Button/Button';
import { DestroyIcon, DiscardIcon, DrawCardIcon } from '@components/ui/Icon/icon';
import { Modal } from '@components/ui/Modal/Modal';
import { useGame } from '@hooks/useGame';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function GameBoard() {
  const { t } = useTranslation();
  const {
    state,
    phase,
    progress,
    endTurnVoluntary,
    rewindEvent,
    canRewind,
    pendingChoices,
    triggerPile,
  } = useGame();
  const { drawPile, discardPile, destroyedPile, instances } = state;

  const [openSheet, setOpenSheet] = useState<'draw' | 'discard' | 'destroyed' | null>(null);
  const [destroyedModalOpen, setDestroyedModalOpen] = useState(false);

  const nextCard = instances[drawPile[0]];

  const drawDeck = useMemo(() => {
    return [...drawPile]
      .map(id => instances[id])
      .filter(Boolean)
      .sort((a, b) => (a.id ?? 9999) - (b.id ?? 9999));
  }, [drawPile, instances]);

  const discardDeck = useMemo(() => {
    return [...discardPile].map(id => instances[id]).filter(Boolean);
  }, [discardPile, instances]);

  const destroyedDeck = useMemo(() => {
    return [...destroyedPile].map(id => instances[id]).filter(Boolean);
  }, [destroyedPile, instances]);

  const deckEmpty = drawPile.length === 0;
  const haveChoiceToDo =
    (!!pendingChoices && pendingChoices.length > 0) ||
    (!!triggerPile && Object.keys(triggerPile).length > 0);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      {/* Main content row — sidebars hidden on mobile */}
      <div className="flex flex-1 items-stretch gap-4 overflow-hidden">
        {phase !== 'pregame' && (
          <div className="hidden lg:contents">
            <DeckViewer
              title={t('deckViewer.draw')}
              icon={<DrawCardIcon className="size-4" />}
              emptyText={t('deckViewer.empty')}
              deck={drawDeck}
              displayedCard={nextCard}
            />
          </div>
        )}

        <MainBoard />

        {phase !== 'pregame' && (
          <div className="hidden lg:contents">
            <DeckViewer
              title={t('deckViewer.discard')}
              icon={<DiscardIcon className="size-4" />}
              deck={discardDeck}
              displayedCard={discardDeck[discardDeck.length - 1]}
              footer={
                destroyedPile.length > 0 ? (
                  <Button
                    onClick={() => setDestroyedModalOpen(true)}
                    variant="text"
                    color="danger"
                    size="xs"
                    className="w-full"
                  >
                    <DestroyIcon className="size-4" />
                    {t('deckViewer.destroyed')} ({destroyedPile.length})
                  </Button>
                ) : null
              }
            />
          </div>
        )}
      </div>

      {/* Mobile action bar */}
      {phase !== 'pregame' && (
        <nav className="bg-background border-t-border z-50 flex items-center justify-between gap-1 border-t px-2 py-2 lg:hidden">
          <Button
            onClick={() => setOpenSheet(o => (o === 'draw' ? null : 'draw'))}
            variant="outlined"
            color="ink"
            size="sm"
          >
            <DrawCardIcon className="size-4" alt={t('deckViewer.draw')} /> ({drawPile.length})
          </Button>

          <div className="flex items-center gap-1">
            {canRewind() && (
              <Button
                onClick={() => rewindEvent()}
                title={t('header.undoTitle')}
                color="danger"
                size="sm"
              >
                ↩
              </Button>
            )}
            <Button
              onClick={progress}
              disabled={deckEmpty || haveChoiceToDo}
              variant="outlined"
              size="sm"
            >
              <span className="hidden lg:inline">›› </span>
              {t('header.progress')}
              {deckEmpty ? '' : ` (${Math.min(2, drawPile.length)})`}
            </Button>
            <Button
              onClick={endTurnVoluntary}
              disabled={haveChoiceToDo}
              variant="outlined"
              size="sm"
            >
              {t('header.endTurn')}
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              onClick={() => setOpenSheet(o => (o === 'discard' ? null : 'discard'))}
              variant="outlined"
              color="ink"
              size="sm"
            >
              <DiscardIcon className="size-4" alt={t('deckViewer.discard')} /> ({discardPile.length}
              )
            </Button>
            {destroyedPile.length > 0 && (
              <Button
                onClick={() => setOpenSheet(o => (o === 'destroyed' ? null : 'destroyed'))}
                variant="outlined"
                color="danger"
                size="sm"
              >
                <DestroyIcon className="size-4" alt={t('deckViewer.destroyed')} /> (
                {destroyedPile.length})
              </Button>
            )}
          </div>
        </nav>
      )}

      {/* Destroyed cards modal (desktop) */}
      {destroyedModalOpen && (
        <CardListModal
          title={t('deckViewer.destroyed')}
          subtitle={t('deckViewer.modalSubtitle', { count: destroyedDeck.length })}
          onClose={() => setDestroyedModalOpen(false)}
        >
          {destroyedDeck.map(inst => (
            <div key={inst.id} className="@container">
              <GameCard instance={inst} className="w-full" />
            </div>
          ))}
        </CardListModal>
      )}

      {/* Mobile bottom sheet for deck viewers */}
      {openSheet !== null && (
        <Modal
          onClose={() => setOpenSheet(null)}
          className="bg-background border-border absolute right-0 bottom-0 left-0 max-h-[90vh] overflow-y-auto rounded-t-2xl border-t shadow-2xl"
        >
          <DeckViewer
            isSheet
            icon={
              {
                draw: <DrawCardIcon className="size-4" />,
                discard: <DiscardIcon className="size-4" />,
                destroyed: <DestroyIcon className="size-4" />,
              }[openSheet]
            }
            title={
              {
                draw: t('deckViewer.draw'),
                discard: t('deckViewer.discard'),
                destroyed: t('deckViewer.destroyed'),
              }[openSheet]
            }
            emptyText={t('deckViewer.empty')}
            deck={
              {
                draw: drawDeck,
                discard: discardDeck,
                destroyed: destroyedDeck,
              }[openSheet]
            }
            displayedCard={
              {
                draw: nextCard,
                discard: discardDeck[discardDeck.length - 1],
                destroyed: destroyedDeck[destroyedDeck.length - 1],
              }[openSheet]
            }
          />
        </Modal>
      )}
    </div>
  );
}
