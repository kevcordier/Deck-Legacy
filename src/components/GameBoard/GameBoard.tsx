import { DeckViewer } from '@components/DeckViewer/DeckViewer';
import { MainBoard } from '@components/MainBoard/MainBoard';
import { Button } from '@components/ui/Button/Button';
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
  const { drawPile, discardPile, instances } = state;

  const [openSheet, setOpenSheet] = useState<'draw' | 'discard' | null>(null);

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
              deck={discardDeck}
              displayedCard={discardDeck[discardDeck.length - 1]}
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
            {t('deckViewer.draw')} ({drawPile.length})
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

          <Button
            onClick={() => setOpenSheet(o => (o === 'discard' ? null : 'discard'))}
            variant="outlined"
            color="ink"
            size="sm"
          >
            {t('deckViewer.discard')} ({discardPile.length})
          </Button>
        </nav>
      )}

      {/* Mobile bottom sheet for deck viewers */}
      {openSheet !== null && (
        <div
          className="fixed inset-0 z-150 bg-black/40 lg:hidden"
          onClick={() => setOpenSheet(null)}
        >
          <div
            className="bg-background border-border absolute right-0 bottom-0 left-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <DeckViewer
              isSheet
              title={t(openSheet === 'draw' ? 'deckViewer.draw' : 'deckViewer.discard')}
              emptyText={t('deckViewer.empty')}
              deck={openSheet === 'draw' ? drawDeck : discardDeck}
              displayedCard={openSheet === 'draw' ? nextCard : discardDeck[discardDeck.length - 1]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
