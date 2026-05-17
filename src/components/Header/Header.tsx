import { Button } from '@components/ui/Button/Button';
import { Title } from '@components/ui/Title/Title';
import { canUseOptions } from '@engine/application/gameStateHelper';
import { Options } from '@engine/domain/enums';
import { Phase } from '@engine/domain/types/Phase';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useTutorial } from '@hooks/useTutorial';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t } = useTranslation();
  const {
    progress,
    endTurnVoluntary,
    startTurn,
    endRound,
    rewindEvent,
    canRewind,
    pendingChoices,
    triggerPile,
    gameState,
    parameters,
  } = useGame();
  const { setOptionsOpen, setRulesOpen } = useGameUI();
  const { run } = useTutorial();
  const deckEmpty = gameState.drawPile.length === 0;

  const haveChoiceToDo =
    (!!pendingChoices && pendingChoices.length > 0) ||
    (!!triggerPile && Object.keys(triggerPile).length > 0);

  const cantAdvance = !canUseOptions(gameState, Options.ADVANCE);

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

      if (!isUndoShortcut || !canRewind() || run) return;

      event.preventDefault();
      rewindEvent();
    };

    globalThis.addEventListener('keydown', onKeyDown);

    return () => {
      globalThis.removeEventListener('keydown', onKeyDown);
    };
  }, [canRewind, rewindEvent, run]);

  return (
    <header
      className="bg-background border-b-border z-101 flex items-center justify-between border-b px-6 py-3"
      data-tour="header"
    >
      <Title level={2}>
        <img
          src="icon-192x192.png"
          alt="Deck Legacy Logo"
          className="h-8 w-auto inline mr-2"
          draggable={false}
        />
        {t('game.title')}
      </Title>

      <div className="align-center flex gap-2">
        <div className="flex items-center gap-2">
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
          {gameState.phase === Phase.PLAYING && (
            <div className="items-center gap-2 hidden lg:flex">
              <Button
                onClick={progress}
                disabled={deckEmpty || haveChoiceToDo || cantAdvance}
                variant="outlined"
                size="xs"
                data-tour="progress"
              >
                <span className="hidden lg:inline">›› </span>
                {t('header.progress')}
                {deckEmpty
                  ? ''
                  : ` (${Math.min(parameters.advanceCardDrawn, gameState.drawPile.length)})`}
              </Button>
              <Button
                onClick={endTurnVoluntary}
                disabled={haveChoiceToDo}
                variant="outlined"
                size="xs"
                data-tour="end-turn-voluntary"
              >
                {t('header.endTurn')}
              </Button>
            </div>
          )}
          {gameState.phase === Phase.ROUND_START && (
            <div className="items-center gap-2 hidden lg:flex">
              <Button onClick={startTurn} variant="outlined" size="xs">
                {t('roundpreview.start')}
              </Button>
            </div>
          )}
          {gameState.phase === Phase.TURN_END && gameState.drawPile.length > 0 && (
            <div className="items-center gap-2 hidden lg:flex">
              <Button onClick={startTurn} variant="outlined" size="xs">
                {t('endturn.start')}
              </Button>
            </div>
          )}
          {(gameState.phase === Phase.ROUND_END ||
            (gameState.phase === Phase.TURN_END && gameState.drawPile.length === 0)) && (
            <div className="items-center gap-2 hidden lg:flex">
              <Button onClick={endRound} variant="outlined" size="xs">
                {t('endround.end')}
              </Button>
            </div>
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
