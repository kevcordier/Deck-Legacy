import { FilterableCardGrid } from '@components/DeckViewer/FilterableCardGrid';
import { GamePhaseActions } from '@components/GamePhaseActions/GamePhaseActions';
import { Header } from '@components/Header/Header';
import { HistoryDrawer } from '@components/HistoryDrawer/HistoryDrawer';
import { KingdomMenu } from '@components/KingdomTable/KingdomMenu';
import { KingdomCards } from '@components/KingdomViewer/KingdomCards';
import { RenameKingdomModal } from '@components/RenameKingdomModal/RenameKingdomModal';
import { Button } from '@components/ui/Button/Button';
import { ChevronDownIcon } from '@components/ui/Icon/icons/ChevronDownIcon';
import { HistoryIcon } from '@components/ui/Icon/icons/HistoryIcon';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { ModalDepthContext } from '@contexts/ModalDepthContext';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useKingdoms } from '@hooks/useKingdoms';
import { useTutorial } from '@hooks/useTutorial';
import { useWebKeyDown } from '@hooks/useWebKeyDown';
import { use, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

/**
 * Game page header: the shared `Header` with the kingdom name in the center (menu to view the
 * kingdom, its destroyed cards or rename it), undo (button and Ctrl/Cmd+Z) and the phase actions.
 */
export function GameHeader() {
  const { t } = useTranslation();
  const {
    id,
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
    startGame,
  } = useGame();
  const { setOptionsOpen, setRulesOpen } = useGameUI();
  const { run } = useTutorial();
  const isDesktop = useIsDesktop();
  // The header is also rendered above each modal: only the page's copy handles Ctrl/Cmd+Z.
  const inModal = use(ModalDepthContext) > 0;
  const [historyOpen, setHistoryOpen] = useState(false);
  const [kingdomModal, setKingdomModal] = useState<
    'view' | 'destroyed' | 'rename' | 'reset' | null
  >(null);
  // The session id is the kingdom id (none for a tutorial outside a kingdom).
  const kingdom = useKingdoms().find(k => k.id === id);
  const { destroyedPile, purgedCards, instances } = gameState;
  const destroyedDeck = useMemo(
    () => [...new Set([...destroyedPile, ...purgedCards])].map(i => instances[i]).filter(Boolean),
    [destroyedPile, purgedCards, instances],
  );
  const deckEmpty = gameState.drawPile.length === 0;
  // No undo once the game is over.
  const canUndo = gameState.phase !== Phase.GAME_OVER && canRewind();

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

      if (inModal || isEditableTarget) return;

      const isUndoShortcut =
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === 'z';

      if (!isUndoShortcut || !canUndo || run) return;

      event.preventDefault();
      rewindEvent();
    },
    [canUndo, rewindEvent, run, inModal],
  );
  useWebKeyDown(onKeyDown);

  return (
    <Header
      onOpenRules={() => setRulesOpen(true)}
      onOpenOptions={() => setOptionsOpen(true)}
      center={
        kingdom && (
          <KingdomMenu
            kingdom={kingdom}
            onView={() => setKingdomModal('view')}
            onViewDestroyed={() => setKingdomModal('destroyed')}
            onRename={() => setKingdomModal('rename')}
            onReset={() => setKingdomModal('reset')}
            seed={gameState.seed}
            className="min-h-11 min-w-0 shrink items-center justify-center gap-1 px-2 active:opacity-70"
          >
            {/* Ellipsis (CSS `text-overflow` on the web) when the name is wider than the space. */}
            <Text
              numberOfLines={1}
              className="font-deco text-primary shrink text-sm tracking-widest lg:text-md"
            >
              {isDesktop ? t('kingdom.titleOf', { name: kingdom.name }) : kingdom.name}
            </Text>
            <ChevronDownIcon className="text-primary size-4 shrink-0" />
          </KingdomMenu>
        )
      }
    >
      {canUndo && (
        <Button
          onPress={() => rewindEvent()}
          title={t('header.undoTitle')}
          color="danger"
          size="xs"
        >
          ↩︎
        </Button>
      )}
      <Button
        onPress={() => setHistoryOpen(true)}
        title={t('history.title')}
        color="danger"
        size="xs"
      >
        <HistoryIcon />
      </Button>
      {historyOpen && <HistoryDrawer onClose={() => setHistoryOpen(false)} />}
      {kingdom && kingdomModal === 'view' && (
        <KingdomCards kingdom={kingdom} onClose={() => setKingdomModal(null)} />
      )}
      {kingdomModal === 'destroyed' && (
        <Modal
          title={t('deckViewer.destroyed')}
          subtitle={t('deckViewer.modalSubtitle', { count: destroyedDeck.length })}
          onClose={() => setKingdomModal(null)}
          side="right"
        >
          <FilterableCardGrid cards={destroyedDeck} />
        </Modal>
      )}
      {kingdom && kingdomModal === 'rename' && (
        <RenameKingdomModal kingdom={kingdom} onClose={() => setKingdomModal(null)} />
      )}
      {kingdom && kingdomModal === 'reset' && (
        <Modal
          title={t('kingdom.resetTitle')}
          onClose={() => setKingdomModal(null)}
          footer={
            <View className="flex-row justify-end gap-2">
              <Button
                size="md"
                variant="text"
                color="ink"
                font="body"
                onPress={() => setKingdomModal(null)}
              >
                {t('kingdom.cancel')}
              </Button>
              <Button
                size="md"
                color="danger"
                font="body"
                onPress={() => {
                  setKingdomModal(null);
                  startGame();
                }}
              >
                {t('kingdom.resetConfirmButton')}
              </Button>
            </View>
          }
        >
          <Text>{t('kingdom.resetConfirm', { name: kingdom.name })}</Text>
        </Modal>
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
