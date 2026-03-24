import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@components/GameBoard/GameBoard.css';
import { useGame } from '@hooks/useGame';
import { Section } from '@components/Section';
import { CardRow } from '@components/CardRow';
import { EmptyState } from '@components/EmptyState';
import { PillBtn } from '@components/PillBtn';
import { GameCard } from '@components/GameCard';
import { ResourceBar } from '@components/ResourceBar';
import { PendingChoiceModal } from '@components/PendingChoiceModal';
import { DeckViewer } from '@components/DeckViewer';
import { DiscardPile } from '@components/DiscardPile';
import { EventLog } from '@components/EventLog';
import { OptionsModal } from '@components/OptionsModal';

export function GameBoard() {
  const game = useGame();
  const {
    state: gs,
    events,
    defs,
    score,
    hasSave,
    loadGame,
    deleteSave,
    startGame,
    startRound,
    activateCard,
    resolveAction,
    resolveUpgrade,
    progress,
    endTurnVoluntary,
    currentTurnStartIndex,
    rewindToEvent,
    resolveChoice,
    resolvePlayFromDiscard,
    resolveResourceChoice,
    resolveCopyProduction,
    resolveChooseState,
    resolveBlockCard,
    resolveDiscardCost,
    cancelDiscardCost,
    canDiscardTopCard,
    discardTopCard,
    startTurn,
  } = game;

  const { t } = useTranslation();
  const [logOpen, setLogOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [drawnUids, setDrawnUids] = useState<Set<string>>(new Set());
  const prevTableauRef = useRef<string[]>([]);

  useEffect(() => {
    if (hasSave) loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const prevTableau = prevTableauRef.current;
    const newlyDrawn = gs.tableau.filter(uid => !prevTableau.includes(uid));
    if (newlyDrawn.length > 0) {
      setDrawnUids(new Set(newlyDrawn));
      const timer = setTimeout(() => setDrawnUids(new Set()), 500);
      prevTableauRef.current = gs.tableau;
      return () => clearTimeout(timer);
    }
    prevTableauRef.current = gs.tableau;
  }, [gs.tableau]);

  const isGameStarted = gs.round > 0 || gs.deck.length > 0;
  const deckEmpty = gs.deck.length === 0;
  const canRewind = events.slice(currentTurnStartIndex + 1).length > 0;

  type Phase = 'pregame' | 'preround' | 'roundpreview' | 'playing';
  let phase: Phase = 'pregame';
  if (!isGameStarted) phase = 'pregame';
  else if (gs.round === 0) phase = 'preround';
  else if (gs.tableau.length === 0 && deckEmpty) phase = 'preround';
  else if (gs.tableau.length === 0 && gs.turn === 0 && !deckEmpty && gs.round > 1)
    phase = 'roundpreview';
  else phase = 'playing';

  return (
    <div className="gb-root">
      {/* ── Header ── */}
      <header className="gb-header">
        <div className="gb-logo">⚜ {t('game.title')}</div>

        <div className="gb-header-actions">
          {canDiscardTopCard && (
            <PillBtn onClick={discardTopCard} variant="ghost">
              {t('header.discardTop')}
            </PillBtn>
          )}
          {phase === 'pregame' && (
            <PillBtn onClick={startGame} variant="gold">
              {t('header.newGame')}
            </PillBtn>
          )}
          {phase === 'preround' && (
            <PillBtn onClick={startRound} variant="gold">
              {gs.round === 0 ? t('header.start') : t('header.newRound')}
            </PillBtn>
          )}
          {phase === 'roundpreview' && (
            <PillBtn onClick={startTurn} variant="gold">
              {t('roundpreview.start')}
            </PillBtn>
          )}
          {phase === 'playing' && (
            <>
              {canRewind && (
                <button
                  className="btn-rewind-header"
                  onClick={() => rewindToEvent(events.length - 2)}
                  title={t('header.undoTitle')}
                >
                  ↩
                </button>
              )}
              <PillBtn onClick={progress} disabled={deckEmpty} variant="ghost">
                {deckEmpty
                  ? t('header.progress')
                  : t('header.progressWithCount', { count: Math.min(2, gs.deck.length) })}
              </PillBtn>
              <PillBtn onClick={endTurnVoluntary} variant="ghost">
                {t('header.endTurn')}
              </PillBtn>
            </>
          )}
          <button
            className="btn-rewind-header"
            onClick={() => setOptionsOpen(true)}
            title={t('header.options')}
          >
            ⚙
          </button>
        </div>
      </header>

      {/* ── Resource bar ── */}
      {isGameStarted && (
        <ResourceBar
          resources={gs.resources}
          score={score}
          round={gs.round}
          turn={gs.turn}
          deckSize={gs.deck.length}
          discardSize={gs.discard.length}
        />
      )}

      {/* ── 3-column body ── */}
      <div className="gb-body">
        <div className="gb-sidebar">
          <DeckViewer deck={gs.deck} instances={gs.instances} defs={defs} />
        </div>

        <main className="gb-main">
          {/* Pregame */}
          {phase === 'pregame' && (
            <EmptyState
              title={t('game.title')}
              subtitle={t('game.subtitle')}
              action={
                <div className="gb-save-actions">
                  <PillBtn onClick={startGame} variant="gold" large>
                    {t('pregame.startNew')}
                  </PillBtn>
                </div>
              }
            />
          )}

          {/* Preround — first */}
          {phase === 'preround' && gs.round === 0 && (
            <EmptyState
              title={t('pregame.readyToPlay')}
              subtitle={t('pregame.deckShuffled', { count: gs.deck.length })}
              action={
                <PillBtn onClick={startRound} variant="gold" large>
                  {t('pregame.startGame')}
                </PillBtn>
              }
            />
          )}

          {/* Preround — end of round */}
          {phase === 'preround' && gs.round > 0 && (
            <div className="gb-preround">
              <div className="gb-preround-header">
                <div className="gb-preround-divider" />
                <div className="gb-preround-title">
                  {t('preround.roundEnded', { round: gs.round })}
                </div>
              </div>
              <PillBtn onClick={startRound} variant="gold" large>
                {t('preround.newRound')}
              </PillBtn>
            </div>
          )}

          {/* Round preview — nouvelles cartes avant le début de la manche */}
          {phase === 'roundpreview' && (
            <div className="gb-preround">
              <div className="gb-preround-header">
                <div className="gb-preround-divider" />
                <div className="gb-preround-title">
                  {t('roundpreview.title', { round: gs.round })}
                </div>
                <div className="gb-preround-subtitle">{t('roundpreview.subtitle')}</div>
              </div>

              {gs.lastAddedUids.length > 0 && (
                <div className="gb-preround-cards">
                  {gs.lastAddedUids.map((uid: string, i: number) => {
                    const inst = gs.instances[uid];
                    if (!inst) return null;
                    return (
                      <GameCard
                        key={uid}
                        instance={inst}
                        defs={defs}
                        currentResources={{}}
                        activated={[]}
                        isInTableau={false}
                        animDelay={i * 100}
                      />
                    );
                  })}
                </div>
              )}

              <PillBtn onClick={startTurn} variant="gold" large>
                {t('roundpreview.start')}
              </PillBtn>
            </div>
          )}

          {/* Permanentes */}
          {gs.permanents.length > 0 && (
            <Section
              title={t('sections.permanents')}
              subtitle={t('cardCount', { count: gs.permanents.length })}
            >
              <CardRow>
                {gs.permanents.map((uid, i) => {
                  const inst = gs.instances[uid];
                  if (!inst) return null;
                  return (
                    <div
                      key={uid}
                      className={drawnUids.has(uid) ? 'card-draw' : ''}
                      style={{ animationDelay: drawnUids.has(uid) ? `${i * 60}ms` : undefined }}
                    >
                      <GameCard
                        instance={inst}
                        defs={defs}
                        currentResources={gs.resources}
                        activated={gs.activated}
                        isInTableau={true}
                        onActivate={() => activateCard(uid)}
                        onAction={label => resolveAction(uid, label)}
                        onUpgrade={id => resolveUpgrade(uid, id)}
                      />
                    </div>
                  );
                })}
              </CardRow>
            </Section>
          )}

          {/* Tableau */}
          {gs.tableau.length > 0 && (
            <Section
              title={t('sections.tableau')}
              subtitle={`${t('cardCount', { count: gs.tableau.length })} · ${t('activatedCount', { count: gs.activated.length })}`}
            >
              <CardRow>
                {gs.tableau.map((uid, i) => {
                  const inst = gs.instances[uid];
                  if (!inst) return null;
                  return (
                    <div
                      key={uid}
                      className={drawnUids.has(uid) ? 'card-draw' : ''}
                      style={{ animationDelay: drawnUids.has(uid) ? `${i * 60}ms` : undefined }}
                    >
                      <GameCard
                        instance={inst}
                        defs={defs}
                        currentResources={gs.resources}
                        activated={gs.activated}
                        isInTableau={true}
                        onActivate={() => activateCard(uid)}
                        onAction={label => resolveAction(uid, label)}
                        onUpgrade={id => resolveUpgrade(uid, id)}
                      />
                    </div>
                  );
                })}
              </CardRow>
            </Section>
          )}
        </main>

        <div className="gb-sidebar gb-sidebar-right">
          <DiscardPile discard={gs.discard} instances={gs.instances} defs={defs} />
        </div>
      </div>

      {/* ── Event log ── */}
      {events.length > 0 && (
        <div className="gb-log-wrapper">
          <button
            className={`gb-log-toggle${logOpen ? ' open' : ''}`}
            onClick={() => setLogOpen(o => !o)}
          >
            <span>{t('sections.eventLog', { count: events.length })}</span>
            <span className="gb-log-toggle-arrow">{logOpen ? '▼' : '▲'}</span>
          </button>
          {logOpen && (
            <div className="gb-log-body">
              <EventLog events={events} />
            </div>
          )}
        </div>
      )}

      {/* ── Pending choice modal ── */}
      {gs.pendingChoice && (
        <PendingChoiceModal
          choice={gs.pendingChoice}
          defs={defs}
          instances={gs.instances}
          currentResources={gs.resources}
          activated={gs.activated}
          onDiscoverCard={resolveChoice}
          onChooseUpgrade={id =>
            resolveUpgrade(
              gs.pendingChoice?.kind === 'choose_upgrade' ? gs.pendingChoice.cardUid : '',
              id,
            )
          }
          onPlayFromDiscard={resolvePlayFromDiscard}
          onChooseResource={resolveResourceChoice}
          onChooseState={resolveChooseState}
          onCopyProduction={resolveCopyProduction}
          onBlockCard={resolveBlockCard}
          onDiscardForCost={resolveDiscardCost}
          onCancelDiscardCost={cancelDiscardCost}
        />
      )}

      {/* ── Options modal ── */}
      {optionsOpen && (
        <OptionsModal
          onClose={() => setOptionsOpen(false)}
          onReset={() => {
            deleteSave();
            startGame();
          }}
        />
      )}
    </div>
  );
}
