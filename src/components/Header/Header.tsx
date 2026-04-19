import { Button } from '@components/ui/Button/Button';
import { Title } from '@components/ui/Title/Title';
import { Phase } from '@engine/domain/types/Phase';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t } = useTranslation();
  const { progress, endTurnVoluntary, rewindEvent, canRewind, pendingChoices, triggerPile, state } =
    useGame();
  const { setOptionsOpen, setRulesOpen } = useGameUI();
  const deckEmpty = state.drawPile.length === 0;

  const haveChoiceToDo =
    (!!pendingChoices && pendingChoices.length > 0) ||
    (!!triggerPile && Object.keys(triggerPile).length > 0);
  return (
    <header className="bg-background border-b-border z-101 flex items-center justify-between border-b px-6 py-3">
      <Title level={2}>{t('game.title')}</Title>

      <div className="align-center flex gap-2">
        {/* Gameplay buttons — hidden on mobile (moved to bottom action bar) */}
        {state.phase === Phase.PLAYING && (
          <div className="hidden items-center gap-2 lg:flex">
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
              <span className="hidden lg:inline">›› </span>
              {t('header.progress')}
              {deckEmpty ? '' : ` (${Math.min(2, state.drawPile.length)})`}
            </Button>
            <Button
              onClick={endTurnVoluntary}
              disabled={haveChoiceToDo}
              variant="outlined"
              size="xs"
            >
              {t('header.endTurn')}
            </Button>
          </div>
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
