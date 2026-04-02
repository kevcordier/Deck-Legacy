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
import { RulesModal } from '@components/RulesModal';

export function GameBoard() {
  const {
    state: gs,
    events,
    defs,
    stickerDefs,
    score,
    pendingChoices,
    triggerPile,
    hasSave,
    loadGame,
    deleteSave,
    startGame,
    startRound,
    startTurn,
    resolveProduction,
    resolveAction,
    resolveUpgrade,
    progress,
    endTurnVoluntary,
    resolvePlayerChoice,
    resolvePayCost,
    skipTrigger,
    canRewind,
    rewindEvent,
  } = useGame();

  const { t } = useTranslation();
  const [logOpen, setLogOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [drawnIds, setDrawnIds] = useState<Set<number>>(new Set());
  const prevBoardRef = useRef<number[]>([]);

  useEffect(() => {
    if (hasSave) loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const prevBoard = prevBoardRef.current;
    const newlyDrawn = gs.board.filter(id => !prevBoard.includes(id));
    if (newlyDrawn.length > 0) {
      setDrawnIds(new Set(newlyDrawn));
      const timer = setTimeout(() => setDrawnIds(new Set()), 500);
      prevBoardRef.current = gs.board;
      return () => clearTimeout(timer);
    }
    prevBoardRef.current = gs.board;
  }, [gs.board]);

  const isGameStarted = gs.round > 0 || gs.drawPile.length > 0;
  const deckEmpty = gs.drawPile.length === 0;

  type Phase = 'pregame' | 'preround' | 'roundpreview' | 'playing';
  let phase: Phase = 'pregame';
  if (!isGameStarted) phase = 'pregame';
  else if (gs.round === 0) phase = 'preround';
  else if (gs.board.length === 0 && gs.turn === 0 && !deckEmpty && gs.round > 1)
    phase = 'roundpreview';
  else phase = 'playing';

  return (
    <div className="gb-root">
      {/* ── Header ── */}
      <header className="gb-header">
        <div className="gb-logo">{t('game.title')}</div>

        <div className="gb-header-actions">
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
              {canRewind() && (
                <button
                  className="btn-rewind-header"
                  onClick={() => rewindEvent()}
                  title={t('header.undoTitle')}
                >
                  ↩
                </button>
              )}
              <PillBtn onClick={progress} disabled={deckEmpty} variant="ghost">
                {deckEmpty
                  ? t('header.progress')
                  : t('header.progressWithCount', { count: Math.min(2, gs.drawPile.length) })}
              </PillBtn>
              <PillBtn onClick={endTurnVoluntary} variant="ghost">
                {t('header.endTurn')}
              </PillBtn>
            </>
          )}
          <button
            className="btn-rewind-header"
            onClick={() => setRulesOpen(true)}
            title={t('rules.open')}
          >
            ?
          </button>
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
          deckSize={gs.drawPile.length}
          discardSize={gs.discardPile.length}
        />
      )}

      {/* ── 3-column body ── */}
      <div className="gb-body">
        <div className="gb-sidebar">
          <DeckViewer deck={gs.drawPile} instances={gs.instances} defs={defs} />
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
              subtitle={t('pregame.deckShuffled', { count: gs.drawPile.length })}
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

              {gs.lastAddedIds.length > 0 && (
                <div className="gb-preround-cards">
                  {gs.lastAddedIds.map((id: number, i: number) => {
                    const inst = gs.instances[id];
                    if (!inst) return null;
                    return (
                      <GameCard
                        key={id}
                        instance={inst}
                        defs={defs}
                        stickerDefs={stickerDefs}
                        currentResources={{}}
                        isOnBoard={false}
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
                {gs.permanents.map((id, i) => {
                  const inst = gs.instances[id];
                  if (!inst) return null;
                  return (
                    <div
                      key={id}
                      className={drawnIds.has(id) ? 'card-draw' : ''}
                      style={{ animationDelay: drawnIds.has(id) ? `${i * 60}ms` : undefined }}
                    >
                      <GameCard
                        instance={inst}
                        defs={defs}
                        stickerDefs={stickerDefs}
                        currentResources={gs.resources}
                        isOnBoard={true}
                        onActivate={() => resolveProduction(id)}
                        onAction={label => resolveAction(id, label)}
                        onUpgrade={upgradeId => resolveUpgrade(id, upgradeId)}
                      />
                    </div>
                  );
                })}
              </CardRow>
            </Section>
          )}

          {/* Tableau (board) */}
          {gs.board.length > 0 && (
            <Section
              title={t('sections.tableau')}
              subtitle={`${t('cardCount', { count: gs.board.length })}`}
            >
              <CardRow>
                {gs.board.map((id, i) => {
                  const inst = gs.instances[id];
                  if (!inst) return null;
                  return (
                    <div
                      key={id}
                      className={drawnIds.has(id) ? 'card-draw' : ''}
                      style={{ animationDelay: drawnIds.has(id) ? `${i * 60}ms` : undefined }}
                    >
                      <GameCard
                        instance={inst}
                        defs={defs}
                        stickerDefs={stickerDefs}
                        currentResources={gs.resources}
                        isOnBoard={true}
                        onActivate={() => resolveProduction(id)}
                        onAction={label => resolveAction(id, label)}
                        onUpgrade={upgradeId => resolveUpgrade(id, upgradeId)}
                        isBlocked={Object.values(gs.blockingCards).includes(id)}
                      />
                    </div>
                  );
                })}
              </CardRow>
            </Section>
          )}
        </main>

        <div className="gb-sidebar gb-sidebar-right">
          <DiscardPile discard={gs.discardPile} instances={gs.instances} defs={defs} />
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

      {/* ── Pending choice modal (inclut triggerPile) ── */}
      {((pendingChoices && pendingChoices.length > 0) ||
        (triggerPile && Object.keys(triggerPile).length > 0)) && (
        <PendingChoiceModal
          choice={pendingChoices?.[0]}
          triggerPile={triggerPile}
          defs={defs}
          instances={gs.instances}
          currentResources={gs.resources}
          resolvePlayerChoice={resolvePlayerChoice}
          resolvePayCost={resolvePayCost}
          onResolveTrigger={resolveAction}
          onSkipTrigger={skipTrigger}
        />
      )}

      {/* ── Rules modal ── */}
      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}

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
