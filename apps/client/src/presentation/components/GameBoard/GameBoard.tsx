import { CardUpgradeReveal } from '@components/CardUpgradeReveal/CardUpgradeReveal';
import { CheatPanel } from '@components/CheatPanel/CheatPanel';
import { DeckViewer } from '@components/DeckViewer/DeckViewer';
import { FilterableCardGrid } from '@components/DeckViewer/FilterableCardGrid';
import { GamePhaseActions } from '@components/GamePhaseActions/GamePhaseActions';
import { MainBoard } from '@components/MainBoard/MainBoard';
import { PendingChoiceModal } from '@components/PendingChoiceModal/PendingChoiceModal';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { DiscardIcon } from '@components/ui/Icon/icons/DiscardIcon';
import { DrawCardIcon } from '@components/ui/Icon/icons/DrawCardIcon';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { useGame } from '@hooks/useGame';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useTutorial } from '@hooks/useTutorial';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SheetName = 'draw' | 'discard';

/** Width of the screen edges where a swipe opens the side sheets (px). */
const EDGE_SWIPE_WIDTH = 20;

/** Phone: a swipe from the screen edge towards the centre opens that side's sheet. */
function EdgeSwipe({
  side,
  onSwipe,
}: {
  readonly side: 'left' | 'right';
  readonly onSwipe: () => void;
}) {
  const fling = Gesture.Fling()
    .direction(side === 'left' ? Directions.RIGHT : Directions.LEFT)
    .runOnJS(true)
    .onEnd(onSwipe);
  return (
    <GestureHandlerRootView
      style={{ position: 'absolute', top: 0, bottom: 0, width: EDGE_SWIPE_WIDTH, [side]: 0 }}
    >
      {/* Web: a vertical swipe on the edge still scrolls the board. */}
      <GestureDetector gesture={fling} touchAction="pan-y">
        <View className="flex-1" />
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

export function GameBoard() {
  const { t } = useTranslation();
  const {
    gameState,
    defs,
    stickerDefs,
    progress,
    endTurnVoluntary,
    startTurn,
    endRound,
    startRound,
    pendingChoices,
    triggerPile,
    resolveAction,
    resolvePlayerChoice,
    resolvePayCost,
    skipTrigger,
    skipChoice,
    parameters,
    upgradeReveal,
    dismissUpgradeReveal,
  } = useGame();
  const { drawPile, discardPile, instances } = gameState;

  const isDesktop = useIsDesktop();
  // A bottom inset means a screen with rounded corners: they would cut buttons stuck to the edges.
  const { bottom: bottomInset } = useSafeAreaInsets();
  const roundedScreen = bottomInset > 0;

  const [openSheet, setOpenSheet] = useState<SheetName | null>(null);
  // Pending choice modal hidden to look at the board: scrolling stays, card actions are locked.
  const choiceKey = pendingChoices?.[0]?.id ?? 'trigger';
  const [peekedKey, setPeekedKey] = useState<string | null>(null);
  const choiceOpen =
    (pendingChoices !== null && pendingChoices.length > 0) ||
    (!!triggerPile && Object.keys(triggerPile).length > 0);
  // Tied to the choice: a new choice (or none) is never shown hidden.
  const peeking = choiceOpen && peekedKey === choiceKey;
  const lockedPointer = { pointerEvents: peeking ? 'none' : 'auto' } as const;
  const centerScrollRef = useRef<ScrollView>(null);
  const centerScrollYRef = useRef(0);
  const { registerScroller } = useTutorial();
  useEffect(
    () =>
      registerScroller(dy =>
        centerScrollRef.current?.scrollTo({ y: Math.max(0, centerScrollYRef.current + dy) }),
      ),
    [registerScroller],
  );

  useEffect(() => {
    if (gameState.phase === Phase.TURN_END || gameState.phase === Phase.ROUND_END) {
      centerScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [gameState.phase]);

  const nextCards = drawPile
    .slice(0, parameters.displayedDrawDeckCards)
    .map(id => instances[id])
    .filter(Boolean);

  const drawDeck = useMemo(() => {
    return [...drawPile]
      .map(id => instances[id])
      .filter(Boolean)
      .sort((a, b) => (a.id ?? 9999) - (b.id ?? 9999));
  }, [drawPile, instances]);

  const discardDeck = useMemo(() => {
    return [...discardPile].map(id => instances[id]).filter(Boolean);
  }, [discardPile, instances]);

  const deckEmpty = drawPile.length === 0;
  const haveChoiceToDo =
    (!!pendingChoices && pendingChoices.length > 0) ||
    (!!triggerPile && Object.keys(triggerPile).length > 0);

  const openDraw = () => setOpenSheet('draw');
  const openDiscard = () => setOpenSheet('discard');

  return (
    <View className="flex-1 overflow-hidden">
      <View className="flex-1 flex-row items-stretch gap-1 overflow-hidden">
        {isDesktop && (
          <TutorialTarget id="draw-column" className="w-64" style={lockedPointer}>
            <DeckViewer
              title={t('deckViewer.draw')}
              deckName="draw"
              icon={<DrawCardIcon className="size-4" />}
              emptyText={t('deckViewer.empty')}
              deck={drawDeck}
              variant="left"
              displayedCards={nextCards}
              stackCount={drawPile.length - nextCards.length}
              footer={
                <TutorialTarget id="discard-button-desktop">
                  <Button
                    onPress={openDiscard}
                    variant="outlined"
                    color="primary"
                    size="xs"
                    className="w-full"
                    accessibilityLabel={t('deckViewer.discard')}
                  >
                    <Text>
                      <DiscardIcon className="size-4" /> {t('deckViewer.discard')} (
                      {discardPile.length})
                    </Text>
                  </Button>
                </TutorialTarget>
              }
            />
          </TutorialTarget>
        )}

        <ScrollView
          ref={centerScrollRef}
          onScroll={event => {
            centerScrollYRef.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          className="flex-1"
          contentContainerClassName="grow"
        >
          <View className="flex-1" style={lockedPointer}>
            <MainBoard />
          </View>
        </ScrollView>

        {!isDesktop && (
          <>
            <EdgeSwipe side="left" onSwipe={openDraw} />
            <EdgeSwipe side="right" onSwipe={openDiscard} />
          </>
        )}
      </View>

      {__DEV__ && <CheatPanel />}

      {!isDesktop && (
        <View
          // The footer owns the bottom safe area (the page skips it) so its color reaches the screen edge.
          style={[lockedPointer, { paddingBottom: bottomInset + 8 }]}
          className={`bg-background border-t-border z-10 flex-row items-center justify-between gap-1 border-t pt-2 ${roundedScreen ? 'px-4' : ''}`}
        >
          <TutorialTarget id="draw-mobile-button">
            <Button
              onPress={openDraw}
              edge={roundedScreen ? undefined : 'left'}
              variant="outlined"
              color="ink"
              size="sm"
              accessibilityLabel={t('deckViewer.draw')}
            >
              <Text>
                <DrawCardIcon className="size-4" /> ({drawPile.length})
              </Text>
            </Button>
          </TutorialTarget>

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
            variant="mobile"
          />

          <TutorialTarget id="discard-mobile-button">
            <Button
              onPress={openDiscard}
              edge={roundedScreen ? undefined : 'right'}
              variant="outlined"
              color="ink"
              size="sm"
              accessibilityLabel={t('deckViewer.discard')}
            >
              <Text>
                <DiscardIcon className="size-4" /> ({discardPile.length})
              </Text>
            </Button>
          </TutorialTarget>
        </View>
      )}

      {choiceOpen && (
        <PendingChoiceModal
          key={choiceKey}
          peeking={peeking}
          onPeekToggle={() => setPeekedKey(k => (k === choiceKey ? null : choiceKey))}
          choice={pendingChoices?.[0]}
          triggerPile={triggerPile}
          defs={defs}
          instances={instances}
          stickerDefs={stickerDefs}
          resolvePlayerChoice={resolvePlayerChoice}
          resolvePayCost={resolvePayCost}
          onResolveTrigger={resolveAction}
          onSkipTrigger={skipTrigger}
          onSkipChoice={skipChoice}
        />
      )}

      {/* Mounted after the other game modals so it stays on top of the triggers and the turn end. */}
      {upgradeReveal && (
        <CardUpgradeReveal
          key={`${upgradeReveal.after.id}-${upgradeReveal.after.stateId}`}
          before={upgradeReveal.before}
          after={upgradeReveal.after}
          onClose={dismissUpgradeReveal}
        />
      )}

      {openSheet === 'discard' && (
        <Modal
          title={t('deckViewer.discard')}
          subtitle={t('deckViewer.modalSubtitle', { count: discardDeck.length })}
          onClose={() => setOpenSheet(null)}
          side="right"
        >
          <FilterableCardGrid cards={discardDeck} />
        </Modal>
      )}

      {openSheet === 'draw' && (
        <Modal
          title={t('deckViewer.draw')}
          subtitle={t('deckViewer.modalSubtitle', { count: drawDeck.length })}
          onClose={() => setOpenSheet(null)}
          side="left"
        >
          {drawDeck.length === 0 ? (
            <Text className="text-ink/50 font-body-italic p-2 text-center text-sm">
              {t('deckViewer.emptyDeck')}
            </Text>
          ) : (
            <FilterableCardGrid cards={drawDeck} hiddenOrder />
          )}
        </Modal>
      )}
    </View>
  );
}
