import { GamePhaseActions } from '@components/GamePhaseActions/GamePhaseActions';
import { Button } from '@components/ui/Button/Button';
import { Title } from '@components/ui/Title/Title';
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
    startRound,
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
              ↩︎
            </Button>
          )}
          <GamePhaseActions
            gameState={gameState}
            deckEmpty={deckEmpty}
            haveChoiceToDo={haveChoiceToDo}
            parameters={parameters}
            progress={progress}
            endTurnVoluntary={endTurnVoluntary}
            startTurn={startTurn}
            endRound={endRound}
            startRound={startRound}
            variant="desktop"
          />
        </div>
        <Button
          onClick={() => setRulesOpen(true)}
          color="danger"
          size="xs"
          title={t('rules.open')}
          data-tour="rules-button"
        >
          ?
        </Button>
        <Button
          onClick={() => setOptionsOpen(true)}
          color="danger"
          size="xs"
          title={t('header.options')}
        >
          ⚙︎
        </Button>
      </div>
    </header>
  );
}
