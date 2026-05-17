import { CheatPanel } from '@components/CheatPanel/CheatPanel';
import { DeckViewer } from '@components/DeckViewer/DeckViewer';
import { GameCard } from '@components/GameCard/GameCard';
import { MainBoard } from '@components/MainBoard/MainBoard';
import { PendingChoiceModal } from '@components/PendingChoiceModal/PendingChoiceModal';
import { Button } from '@components/ui/Button/Button';
import { DestroyIcon, DiscardIcon, DrawCardIcon } from '@components/ui/Icon/icon';
import { Modal } from '@components/ui/Modal/Modal';
import { Phase } from '@engine/domain/types';
import { useGame } from '@hooks/useGame';
import { useTutorial } from '@hooks/useTutorial';
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
    startTurn,
    endRound,
    pendingChoices,
    triggerPile,
    resolveAction,
    resolvePlayerChoice,
    resolvePayCost,
    skipTrigger,
    skipChoice,
    parameters,
  } = useGame();
  const { drawPile, discardPile, destroyedPile, instances } = gameState;

  const { run, nextStep } = useTutorial();

  const [openSheet, setOpenSheet] = useState<'draw' | 'discard' | 'destroyed' | null>(null);
  const [destroyedModalOpen, setDestroyedModalOpen] = useState(false);
  const [pinnedLeft, setPinnedLeft] = useState(true);
  const [pinnedRight, setPinnedRight] = useState(false);

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

  const columnClassLeft =
    'w-15 hover:w-64 absolute z-50 left-0 hover:shadow-xl transition-[width] hover:delay-500 ease-in-out hover:position-absolute';
  const columnClassRight =
    'w-15 hover:w-64 absolute z-50 right-0 hover:shadow-xl transition-[width] hover:delay-500 ease-in-out hover:position-absolute';

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden" data-tour="game-board">
      {/* Main content row — sidebars hidden on mobile */}
      <div className="flex relative flex-1 items-stretch overflow-hidden gap-1">
        <div
          className={`hidden lg:flex h-full ${pinnedLeft ? 'w-64 delay-0' : columnClassLeft}`}
          data-tour="draw-column"
        >
          <DeckViewer
            title={t('deckViewer.draw')}
            deckName="draw"
            icon={<DrawCardIcon className="size-4" />}
            emptyText={t('deckViewer.empty')}
            pinned={pinnedLeft}
            onTogglePinned={() => setPinnedLeft(p => !p)}
            deck={drawDeck}
            variant="left"
            displayedCards={nextCards}
          />
        </div>

        <div
          className={`${pinnedLeft ? '' : 'lg:pl-15'} ${pinnedRight ? '' : 'lg:pr-15'} flex-1 h-full relative scrollbar `}
        >
          <MainBoard />
        </div>

        <div
          className={`hidden lg:flex h-full ${pinnedRight ? 'w-64 delay-0' : columnClassRight}`}
          data-tour="discard-column"
        >
          <DeckViewer
            title={t('deckViewer.discard')}
            deckName="discard"
            icon={<DiscardIcon className="size-4" />}
            deck={discardDeck}
            pinned={pinnedRight}
            onTogglePinned={() => {
              // Tutorial step: when the user pins the discard viewer, if we're on step 5, move to the next step which explains the discard viewer content
              if (run) {
                nextStep();
              }
              setPinnedRight(p => !p);
            }}
            variant="right"
            displayedCards={discardDeck.length > 0 ? [discardDeck[discardDeck.length - 1]] : []}
            footer={
              destroyedPile.length > 0 ? (
                <Button
                  onClick={() => setDestroyedModalOpen(true)}
                  variant="text"
                  color="danger"
                  size="xs"
                  className="w-full"
                  data-tour="destroyed-button-desktop"
                >
                  <DestroyIcon className="size-4" />
                  {t('deckViewer.destroyed')} ({destroyedPile.length})
                </Button>
              ) : null
            }
          />
        </div>
      </div>

      <CheatPanel />

      {/* Mobile action bar */}
      <nav className="bg-background border-t-border z-50 flex items-center justify-between gap-1 border-t px-2 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
        <Button
          onClick={() => {
            setOpenSheet('draw');
            if (run) {
              nextStep();
            }
          }}
          variant="outlined"
          color="ink"
          size="sm"
          data-tour="draw-mobile-button"
        >
          <DrawCardIcon className="size-4" alt={t('deckViewer.draw')} /> ({drawPile.length})
        </Button>

        {gameState.phase === Phase.PLAYING && (
          <div className="flex items-center gap-1">
            <Button
              onClick={progress}
              disabled={deckEmpty || haveChoiceToDo}
              variant="outlined"
              size="sm"
              data-tour="progress-mobile"
            >
              {deckEmpty ? '››' : `›› (${Math.min(2, drawPile.length)})`}
            </Button>
            <Button
              onClick={endTurnVoluntary}
              disabled={haveChoiceToDo}
              variant="outlined"
              size="sm"
              data-tour="end-turn-voluntary-mobile"
            >
              {t('header.endTurn')}
            </Button>
          </div>
        )}
        {gameState.phase === Phase.ROUND_START && (
          <div className="flex items-center gap-1">
            <Button onClick={startTurn} variant="outlined" size="sm">
              {t('roundpreview.start')}
            </Button>
          </div>
        )}
        {gameState.phase === Phase.TURN_END && gameState.drawPile.length > 0 && (
          <div className="flex items-center gap-1">
            <Button onClick={startTurn} variant="outlined" size="sm">
              {t('endturn.start')}
            </Button>
          </div>
        )}
        {(gameState.phase === Phase.ROUND_END ||
          (gameState.phase === Phase.TURN_END && gameState.drawPile.length === 0)) && (
          <div className="flex items-center gap-1">
            <Button onClick={endRound} variant="outlined" size="sm">
              {t('endround.end')}
            </Button>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            onClick={() => setOpenSheet('discard')}
            variant="outlined"
            color="ink"
            size="sm"
            data-tour="discard-mobile-button"
          >
            <DiscardIcon className="size-4" alt={t('deckViewer.discard')} /> ({discardPile.length})
          </Button>
          {destroyedPile.length > 0 && (
            <Button
              onClick={() => setOpenSheet('destroyed')}
              variant="outlined"
              color="danger"
              size="sm"
              data-tour="destroyed-button-mobile"
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
                <div className={`@container min-w-60`} key={inst.id}>
                  <GameCard instance={inst} />
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Mobile bottom sheet for deck viewers */}
      {openSheet !== null && (
        <Modal
          onClose={() => {
            if (run) {
              nextStep();
            }
            setOpenSheet(null);
          }}
          className="bg-background border-border absolute right-0 bottom-0 left-0 max-h-[90vh] overflow-y-auto rounded-t-2xl border-t shadow-2xl"
          label="mobile-deck-viewer"
        >
          <DeckViewer
            data-tour="mobile-deck-viewer"
            variant="full"
            deckName={openSheet}
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
