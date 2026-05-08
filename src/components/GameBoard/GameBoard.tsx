import { DeckViewer } from '@components/DeckViewer/DeckViewer';
import { EventPanel } from '@components/EventPanel/EventPanel';
import { GameCard } from '@components/GameCard/GameCard';
import { MainBoard } from '@components/MainBoard/MainBoard';
import { PendingChoiceModal } from '@components/PendingChoiceModal/PendingChoiceModal';
import { Button } from '@components/ui/Button/Button';
import { DestroyIcon, DiscardIcon, DrawCardIcon } from '@components/ui/Icon/icon';
import { MarkdownText } from '@components/ui/MarkdownText/MarckdownText';
import { Modal } from '@components/ui/Modal/Modal';
import { tCardParchmentText } from '@helpers/cardI18n';
import { useGame } from '@hooks/useGame';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function GameBoard() {
  const { t } = useTranslation();
  const {
    gameState,
    defs,
    stickerDefs,
    progress,
    endTurnVoluntary,
    rewindEvent,
    canRewind,
    pendingChoices,
    triggerPile,
    parchmentTextPending,
    dismissParchmentText,
    resolveAction,
    resolvePlayerChoice,
    resolvePayCost,
    skipTrigger,
    skipChoice,
    globalError,
    dismissGlobalError,
    parameters,
  } = useGame();
  const { drawPile, discardPile, destroyedPile, instances } = gameState;

  const [openSheet, setOpenSheet] = useState<'draw' | 'discard' | 'destroyed' | null>(null);
  const [destroyedModalOpen, setDestroyedModalOpen] = useState(false);

  const nextCards = drawPile
    .slice(0, parameters.displayedDrawDeckCards)
    .map(id => instances[id])
    .filter(Boolean);

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
      <div className="flex flex-1 items-stretch overflow-hidden gap-1">
        <div className="hidden lg:contents">
          <DeckViewer
            title={t('deckViewer.draw')}
            icon={<DrawCardIcon className="size-4" />}
            emptyText={t('deckViewer.empty')}
            deck={drawDeck}
            displayedCards={nextCards}
          />
        </div>

        <MainBoard />

        {parchmentTextPending && (
          <div className="flex flex-col gap-4 p-4">
            <MarkdownText text={tCardParchmentText(t, parchmentTextPending.id)} />
            <div className="flex justify-end">
              <Button color="base-primary" onClick={dismissParchmentText}>
                {t('parchmentCard.continue')}
              </Button>
            </div>
          </div>
        )}

        <div className="hidden lg:contents">
          <DeckViewer
            title={t('deckViewer.discard')}
            icon={<DiscardIcon className="size-4" />}
            deck={discardDeck}
            displayedCards={discardDeck.length > 0 ? [discardDeck[discardDeck.length - 1]] : []}
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
      </div>

      <EventPanel />

      {/* Mobile action bar */}
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
          <Button onClick={endTurnVoluntary} disabled={haveChoiceToDo} variant="outlined" size="sm">
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
            <DiscardIcon className="size-4" alt={t('deckViewer.discard')} /> ({discardPile.length})
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

      {((pendingChoices !== null && pendingChoices.length > 0) ||
        (triggerPile && Object.keys(triggerPile).length > 0)) && (
        <PendingChoiceModal
          key={pendingChoices?.[0]?.id}
          choice={pendingChoices?.[0]}
          triggerPile={triggerPile}
          defs={defs}
          instances={instances}
          stickerDefs={stickerDefs}
          resolvePlayerChoice={resolvePlayerChoice}
          resolvePayCost={resolvePayCost}
          onResolveTrigger={resolveAction}
          onSkipTrigger={skipTrigger}
          onSkipChoice={skipChoice}
        />
      )}

      {globalError && (
        <div className="fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-red-900/30 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-lg">
          <span className="flex-1">{globalError}</span>
          <Button onClick={dismissGlobalError} variant="text" color="danger" size="sm">
            ✕
          </Button>
        </div>
      )}

      {/* Destroyed cards modal (desktop) */}
      {destroyedModalOpen && (
        <Modal
          title={t('deckViewer.destroyed')}
          subtitle={t('deckViewer.modalSubtitle', { count: destroyedDeck.length })}
          onClose={() => {
            setDestroyedModalOpen(false);
          }}
        >
          <div className="flex flex-col">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {destroyedDeck.map(inst => (
                <div key={inst.id}>
                  <GameCard instance={inst} className="w-full" />
                </div>
              ))}
            </div>
          </div>
        </Modal>
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
            displayedCards={
              {
                draw: nextCards,
                discard: discardDeck.length > 0 ? [discardDeck[discardDeck.length - 1]] : [],
                destroyed:
                  destroyedDeck.length > 0 ? [destroyedDeck[destroyedDeck.length - 1]] : [],
              }[openSheet]
            }
          />
        </Modal>
      )}
    </div>
  );
}
