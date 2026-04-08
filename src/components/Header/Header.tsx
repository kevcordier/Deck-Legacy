import { Button } from '@components/ui/Button/Button';
import { Title } from '@components/ui/Title/Title';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t } = useTranslation();
  const {
    startGame,
    startRound,
    startTurn,
    progress,
    endTurnVoluntary,
    rewindEvent,
    canRewind,
    pendingChoices,
    triggerPile,
    state,
    phase,
  } = useGame();
  const { setOptionsOpen, setRulesOpen } = useGameUI();
  const deckEmpty = state.drawPile.length === 0;

  const haveChoiceToDo =
    (!!pendingChoices && pendingChoices.length > 0) ||
    (!!triggerPile && Object.keys(triggerPile).length > 0);
  return (
    <header className="bg-background border-b-border z-101 flex items-center justify-between border-b px-6 py-3">
      <Title level={2}>{t('game.title')}</Title>

      <div className="align-center flex gap-2">
        {phase === 'pregame' && (
          <Button onClick={startGame} size="xs" variant="outlined">
            {t('header.newGame')}
          </Button>
        )}
        {phase === 'preround' && (
          <Button onClick={startRound} disabled={haveChoiceToDo} size="xs" variant="outlined">
            {state.round === 0 ? t('header.start') : t('header.newRound')}
          </Button>
        )}
        {phase === 'roundpreview' && (
          <Button onClick={startTurn} disabled={haveChoiceToDo} size="xs" variant="outlined">
            {t('roundpreview.start')}
          </Button>
        )}
        {phase === 'playing' && (
          <>
            {canRewind() && (
              <Button
                onClick={() => rewindEvent()}
                title={t('header.undoTitle')}
                color="danger"
                size="xs"
              >
                ↩
              </Button>
            )}
            <Button
              onClick={progress}
              disabled={deckEmpty || haveChoiceToDo}
              variant="outlined"
              size="xs"
            >
              {deckEmpty
                ? t('header.progress')
                : t('header.progressWithCount', { count: Math.min(2, state.drawPile.length) })}
            </Button>
            <Button
              onClick={endTurnVoluntary}
              disabled={haveChoiceToDo}
              variant="outlined"
              size="xs"
            >
              {t('header.endTurn')}
            </Button>
          </>
        )}
        <Button onClick={() => setRulesOpen(true)} color="danger" size="xs" title={t('rules.open')}>
          ?
        </Button>
        <Button
          onClick={() => setOptionsOpen(true)}
          color="danger"
          size="xs"
          title={t('header.options')}
        >
          ⚙
        </Button>
      </div>
    </header>
  );
}
