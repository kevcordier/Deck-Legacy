import { CheatPanel } from '@components/CheatPanel/CheatPanel';
import { DeckCardGrid, DeckViewer } from '@components/DeckViewer/DeckViewer';
import { GamePhaseActions } from '@components/GamePhaseActions/GamePhaseActions';
import { MainBoard } from '@components/MainBoard/MainBoard';
import { PendingChoiceModal } from '@components/PendingChoiceModal/PendingChoiceModal';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { DestroyIcon, DiscardIcon, DrawCardIcon } from '@components/ui/Icon/icon';
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

type SheetName = 'draw' | 'discard' | 'destroyed';

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
  } = useGame();
  const { drawPile, discardPile, destroyedPile, purgedCards, instances } = gameState;

  const { run, nextStep } = useTutorial();
  const isDesktop = useIsDesktop();

  const [openSheet, setOpenSheet] = useState<SheetName | null>(null);
  const [destroyedModalOpen, setDestroyedModalOpen] = useState(false);
  const [pinnedLeft, setPinnedLeft] = useState(true);
  const [pinnedRight, setPinnedRight] = useState(true);
  const centerScrollRef = useRef<ScrollView>(null);

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

  const destroyedDeck = useMemo(() => {
    const allDestroyedIds = [...new Set([...destroyedPile, ...purgedCards])];
    return allDestroyedIds.map(id => instances[id]).filter(Boolean);
  }, [destroyedPile, purgedCards, instances]);

  const deckEmpty = drawPile.length === 0;
  const haveChoiceToDo =
    (!!pendingChoices && pendingChoices.length > 0) ||
    (!!triggerPile && Object.keys(triggerPile).length > 0);

  const openDraw = () => {
    setOpenSheet('draw');
    if (run) {
      nextStep();
    }
  };
  const openDiscard = () => setOpenSheet('discard');

  const lastDiscarded = discardDeck.length > 0 ? [discardDeck[discardDeck.length - 1]] : [];
  const lastDestroyed = destroyedDeck.length > 0 ? [destroyedDeck[destroyedDeck.length - 1]] : [];

  const sheets: Record<
    SheetName,
    {
      title: string;
      icon: React.ReactNode;
      deck: typeof drawDeck;
      displayed: typeof drawDeck;
      stackCount?: number;
    }
  > = {
    draw: {
      title: t('deckViewer.draw'),
      icon: <DrawCardIcon className="size-4" />,
      deck: drawDeck,
      displayed: nextCards,
      stackCount: drawPile.length - nextCards.length,
    },
    discard: {
      title: t('deckViewer.discard'),
      icon: <DiscardIcon className="size-4" />,
      deck: discardDeck,
      displayed: lastDiscarded,
      stackCount: discardPile.length - 1,
    },
    destroyed: {
      title: t('deckViewer.destroyed'),
      icon: <DestroyIcon className="size-4" />,
      deck: destroyedDeck,
      displayed: lastDestroyed,
    },
  };

  return (
    <View className="flex-1 overflow-hidden">
      <View className="flex-1 flex-row items-stretch gap-1 overflow-hidden">
        {isDesktop && (
          <TutorialTarget id="draw-column" className={pinnedLeft ? 'w-64' : 'w-[60px]'}>
            <DeckViewer
              title={t('deckViewer.draw')}
              deckName="draw"
              icon={<DrawCardIcon className="size-4" />}
              emptyText={t('deckViewer.empty')}
              pinned={pinnedLeft}
              onTogglePinned={() => setPinnedLeft(p => !p)}
              deck={drawDeck}
              variant="left"
              displayedCards={nextCards}
              stackCount={drawPile.length - nextCards.length}
            />
          </TutorialTarget>
        )}

        <ScrollView ref={centerScrollRef} className="flex-1" contentContainerClassName="grow">
          <MainBoard />
        </ScrollView>

        {!isDesktop && (
          <>
            <EdgeSwipe side="left" onSwipe={openDraw} />
            <EdgeSwipe side="right" onSwipe={openDiscard} />
          </>
        )}

        {isDesktop && (
          <TutorialTarget id="discard-column" className={pinnedRight ? 'w-64' : 'w-[60px]'}>
            <DeckViewer
              title={t('deckViewer.discard')}
              deckName="discard"
              icon={<DiscardIcon className="size-4" />}
              deck={discardDeck}
              pinned={pinnedRight}
              onTogglePinned={() => {
                if (run) {
                  nextStep();
                }
                setPinnedRight(p => !p);
              }}
              variant="right"
              displayedCards={lastDiscarded}
              stackCount={discardPile.length - 1}
              footer={
                destroyedDeck.length > 0 ? (
                  <TutorialTarget id="destroyed-button-desktop">
                    <Button
                      onPress={() => setDestroyedModalOpen(true)}
                      variant="text"
                      color="danger"
                      size="xs"
                      className="w-full"
                    >
                      <Text>
                        <DestroyIcon className="size-4" />
                        {pinnedRight && ` ${t('deckViewer.destroyed')} (${destroyedDeck.length})`}
                      </Text>
                    </Button>
                  </TutorialTarget>
                ) : null
              }
            />
          </TutorialTarget>
        )}
      </View>

      {__DEV__ && <CheatPanel />}

      {!isDesktop && (
        <View className="bg-background border-t-border z-10 flex-row items-center justify-between gap-1 border-t py-2">
          <TutorialTarget id="draw-mobile-button">
            <Button
              onPress={openDraw}
              edge="left"
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

          <View className="flex-row items-center gap-1">
            {destroyedDeck.length > 0 && (
              <TutorialTarget id="destroyed-button-mobile">
                <Button
                  onPress={() => setOpenSheet('destroyed')}
                  variant="outlined"
                  color="danger"
                  size="sm"
                  accessibilityLabel={t('deckViewer.destroyed')}
                >
                  <Text>
                    <DestroyIcon className="size-4" /> ({destroyedDeck.length})
                  </Text>
                </Button>
              </TutorialTarget>
            )}
            <TutorialTarget id="discard-mobile-button">
              <Button
                onPress={openDiscard}
                edge="right"
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
        </View>
      )}

      {((pendingChoices !== null && pendingChoices.length > 0) ||
        (triggerPile && Object.keys(triggerPile).length > 0)) && (
        <PendingChoiceModal
          key={pendingChoices?.[0]?.id}
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

      {destroyedModalOpen && (
        <Modal
          title={t('deckViewer.destroyed')}
          subtitle={t('deckViewer.modalSubtitle', { count: destroyedDeck.length })}
          onClose={() => setDestroyedModalOpen(false)}
          side="right"
        >
          <DeckCardGrid cards={destroyedDeck} />
        </Modal>
      )}

      {openSheet !== null && (
        <Modal
          onClose={() => {
            if (run) {
              nextStep();
            }
            setOpenSheet(null);
          }}
          label="mobile-deck-viewer"
          side={openSheet === 'draw' ? 'left' : 'right'}
        >
          <DeckViewer
            variant="full"
            deckName={openSheet}
            icon={sheets[openSheet].icon}
            title={sheets[openSheet].title}
            emptyText={t('deckViewer.empty')}
            deck={sheets[openSheet].deck}
            displayedCards={sheets[openSheet].displayed}
            stackCount={sheets[openSheet].stackCount}
          />
        </Modal>
      )}
    </View>
  );
}
