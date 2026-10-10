import { GamePhaseActions } from '@components/GamePhaseActions/GamePhaseActions';
import { Header } from '@components/Header/Header';
import { Button } from '@components/ui/Button/Button';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useTutorial } from '@hooks/useTutorial';
import { useWebKeyDown } from '@hooks/useWebKeyDown';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** Game page header: the shared `Header` with undo (button and Ctrl/Cmd+Z) and the phase actions. */
export function GameHeader() {
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
  const isDesktop = useIsDesktop();
  const deckEmpty = gameState.drawPile.length === 0;

  const haveChoiceToDo =
    (!!pendingChoices && pendingChoices.length > 0) ||
    (!!triggerPile && Object.keys(triggerPile).length > 0);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
    },
    [canRewind, rewindEvent, run],
  );
  useWebKeyDown(onKeyDown);

  return (
    <Header onOpenRules={() => setRulesOpen(true)} onOpenOptions={() => setOptionsOpen(true)}>
      {canRewind() && (
        <Button
          onPress={() => rewindEvent()}
          title={t('header.undoTitle')}
          color="danger"
          size="xs"
        >
          ↩︎
        </Button>
      )}
      {isDesktop && (
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
      )}
    </Header>
  );
}
