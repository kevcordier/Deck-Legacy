import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@pages/Game/Game.css';
import { useGame } from '@hooks/useGame';
import { ResourceBar } from '@components/ResourceBar';
import { PendingChoiceModal } from '@components/PendingChoiceModal';
import { EventLog } from '@components/EventLog';
import { OptionsModal } from '@components/OptionsModal';
import { RulesModal } from '@components/RulesModal';
import { Header } from '@components/Header/Header';
import { useGameUI } from '@hooks/useGameInterface';
import { GameBoard } from '@components/GameBoard/GameBoard';

export function Game() {
  const {
    state: gs,
    events,
    defs,
    pendingChoices,
    triggerPile,
    hasSave,
    phase,
    loadGame,
    deleteSave,
    startGame,
    resolveAction,
    resolvePlayerChoice,
    resolvePayCost,
    skipTrigger,
  } = useGame();

  const { setOptionsOpen, setRulesOpen, optionsOpen, rulesOpen } = useGameUI();

  const { t } = useTranslation();
  const [logOpen, setLogOpen] = useState(false);

  useEffect(() => {
    if (hasSave) loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="z-1 flex h-screen flex-col">
      {/* ── Header ── */}
      <Header />

      {/* ── Resource bar ── */}
      {phase !== 'pregame' && <ResourceBar />}

      {/* ── 3-column body ── */}
      <GameBoard />

      {/* ── Event log ── */}
      {events.length > 0 && (
        <div className="gb-log-wrapper">
          <button
            className={`gb-log-toggle ${logOpen ? 'open' : ''}`}
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
