import { Button } from '@components/ui/Button/Button';
import { Title } from '@components/ui/Title/Title';
import { Phase } from '@engine/domain/types/Phase';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useEffect } from 'react';
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditableTarget =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT');

      if (isEditableTarget) return;

      const isUndoShortcut =
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === 'z';

      if (!isUndoShortcut || !canRewind()) return;

      event.preventDefault();
      rewindEvent();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [canRewind, rewindEvent]);

  return (
    <header className="bg-background border-b-border z-101 flex items-center justify-between border-b px-6 py-3">
      <Title level={2}>{t('game.title')}</Title>

      <div className="align-center flex gap-2">
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
          {state.phase === Phase.PLAYING && (
            <>
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
            </>
          )}
        </div>
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
