import { type BoardZoomLevel, CardRow } from '@components/CardRow/CardRow';
import { RaiseOnDrag } from '@components/CardRow/RaiseOnDrag';
import { CardViewerModal } from '@components/CardViewerModal/CardViewerModal';
import { PileTop } from '@components/DeckViewer/PileTop';
import { GameCard } from '@components/GameCard/GameCard';
import { MiniGameCard } from '@components/MiniGameCard/MiniGameCard';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { ZoomInIcon } from '@components/ui/Icon/icons/ZoomInIcon';
import { ZoomOutIcon } from '@components/ui/Icon/icons/ZoomOutIcon';
import { MarkdownText } from '@components/ui/MarkdownText/MarkdownText';
import { Modal } from '@components/ui/Modal/Modal';
import { Section } from '@components/ui/Section/Section';
import { getActiveState } from '@deck-legacy/engine/domain/cardHelpers';
import { CardTag, Phase } from '@deck-legacy/engine/domain/enums';
import { isLastRound } from '@deck-legacy/engine/domain/gameStateHelper';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { useGame } from '@hooks/useGame';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { tCardName } from '@i18n/card/tCardName';
import { tCardParchmentText } from '@i18n/card/tCardParchmentText';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

const MIN_ZOOM: BoardZoomLevel = 0;
const MAX_ZOOM: BoardZoomLevel = 1;

function NewCardSelection({
  cardIds,
  chooseState,
}: {
  readonly cardIds: number[];
  readonly chooseState: (id: number, stateId: number) => void;
}) {
  const { gameState, defs } = useGame();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const [viewerCardId, setViewerCardId] = useState<number | null>(null);
  // Fixed width on desktop: the modal is auto-sized, so a percentage would resolve against its own
  // content and shrink the card. Two mini cards on phones, where a tap opens the card in large.
  const itemClass = isDesktop ? 'w-64' : 'w-[48%] max-w-56';
  const card = (inst: CardInstance) =>
    isDesktop ? (
      <GameCard instance={inst} />
    ) : (
      <MiniGameCard instance={inst} onPress={() => setViewerCardId(inst.id)} />
    );

  return (
    <View className="w-full flex-row flex-wrap items-end justify-center gap-2 lg:gap-4">
      {cardIds.map((id: number) => {
        const inst = gameState.instances[id];
        if (!inst) return null;
        const chooseStateIds = defs[inst.cardId].chooseState ?? [];

        if (chooseStateIds.length > 0) {
          return (
            <View key={id} className={`min-w-0 gap-1 ${itemClass}`}>
              <View className="mb-2 w-full gap-2">
                {chooseStateIds.map(stateId => {
                  const stateDef = defs[inst.cardId].states.find(s => s.id === stateId);
                  const isCurrent = inst.stateId === stateId;
                  return (
                    <Button
                      key={`${id}-${stateId}`}
                      color={isCurrent ? 'base-primary' : 'danger'}
                      size="sm"
                      onPress={() => chooseState(inst.id, stateId)}
                    >
                      {stateDef?.name
                        ? tCardName(t, stateDef.name)
                        : `${t('roundpreview.switchState')} ${stateId}`}
                    </Button>
                  );
                })}
              </View>
              {card(inst)}
            </View>
          );
        }

        return (
          <View key={id} className={itemClass}>
            {card(inst)}
          </View>
        );
      })}
      {viewerCardId !== null && (
        <CardViewerModal
          cardIds={cardIds}
          initialId={viewerCardId}
          onClose={() => setViewerCardId(null)}
        />
      )}
    </View>
  );
}

export function MainBoard() {
  const {
    gameState,
    startTurn,
    endTurnVoluntary,
    endRound,
    startRound,
    chooseState,
    displayNewCards,
    setDisplayNewCards,
    defs,
    parchmentTextPending,
    dismissParchmentText,
    parameters,
  } = useGame();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const [zoom, setZoom] = useState<BoardZoomLevel>(1);
  const goals = gameState.permanents.filter(
    c => getActiveState(gameState.instances[c], defs)?.tags?.includes(CardTag.GOAL) ?? false,
  );
  const permanents = gameState.permanents.filter(c => !goals.includes(c));
  const lastRound = isLastRound(gameState, parameters);

  const zoomControls = isDesktop ? (
    <View className="flex-row">
      <Button
        variant="text"
        color="ink"
        size="xs"
        onPress={() => setZoom(z => (z < MAX_ZOOM ? ((z + 1) as BoardZoomLevel) : z))}
        disabled={zoom >= MAX_ZOOM}
        accessibilityLabel={t('board.zoomOut')}
      >
        <ZoomOutIcon className="size-5" />
      </Button>
      <Button
        variant="text"
        color="ink"
        size="xs"
        onPress={() => setZoom(z => (z > MIN_ZOOM ? ((z - 1) as BoardZoomLevel) : z))}
        disabled={zoom <= MIN_ZOOM}
        accessibilityLabel={t('board.zoomIn')}
      >
        <ZoomInIcon className="size-5" />
      </Button>
    </View>
  ) : null;

  // A card whose state must be chosen needs the selection buttons, which the viewer lacks.
  const hasStateChoice = gameState.lastAddedCards.some(
    id => (defs[gameState.instances[id]?.cardId]?.chooseState?.length ?? 0) > 0,
  );

  const isBoardPhase = [Phase.PLAYING, Phase.TURN_END].includes(gameState.phase);

  // Top of the draw pile: on desktop it is in the left column.
  const { drawPile } = gameState;
  const nextCards = drawPile
    .slice(0, parameters.displayedDrawDeckCards)
    .map(id => gameState.instances[id])
    .filter(Boolean);

  return (
    <View className="flex-1 gap-6 p-2 lg:p-4">
      {parchmentTextPending && (
        <View className="bg-card gap-4 rounded-lg p-4">
          <MarkdownText text={tCardParchmentText(t, parchmentTextPending.id)} ink />
          <View className="flex-row justify-end">
            <Button color="base-primary" onPress={dismissParchmentText}>
              {t('parchmentCard.continue')}
            </Button>
          </View>
        </View>
      )}
      {gameState.phase === Phase.ROUND_START && (
        <TutorialTarget id="round-preview">
          <EmptyState
            wide
            title={t('roundpreview.title', { round: gameState.round })}
            subtitle={t('roundpreview.subtitle')}
            action={
              <Button onPress={startTurn} color="primary" size="md">
                {t('roundpreview.start')}
              </Button>
            }
          >
            {gameState.lastAddedCards.length > 0 && (
              <NewCardSelection cardIds={gameState.lastAddedCards} chooseState={chooseState} />
            )}
          </EmptyState>
        </TutorialTarget>
      )}

      {gameState.phase === Phase.TURN_END && gameState.drawPile.length > 0 && (
        <EmptyState
          title={t('endturn.title', { turn: gameState.turn + 1 })}
          action={
            <TutorialTarget id="phase-action">
              <Button onPress={startTurn} color="primary" size="md">
                {t('endturn.start')}
              </Button>
            </TutorialTarget>
          }
        />
      )}

      {gameState.phase === Phase.TURN_END && gameState.drawPile.length === 0 && (
        <EmptyState
          title={t('endround.title', { round: gameState.round })}
          action={
            <TutorialTarget id="phase-action">
              <Button onPress={endRound} color="primary" size="md">
                {t('endround.end')}
              </Button>
            </TutorialTarget>
          }
        />
      )}

      {gameState.phase === Phase.ROUND_END && !lastRound && (
        <EmptyState
          title={t('roundpreview.title', { round: gameState.round })}
          action={
            <Button onPress={startRound} color="primary" size="md">
              {t('roundpreview.start')}
            </Button>
          }
        />
      )}

      {gameState.phase === Phase.ROUND_END && lastRound && (
        <EmptyState
          title={t('lastRound.title', { round: gameState.round })}
          subtitle={t('lastRound.subtitle')}
          action={
            <Button onPress={endRound} color="primary" size="md">
              {t('lastRound.end')}
            </Button>
          }
        />
      )}

      {!isDesktop && isBoardPhase && nextCards.length > 0 && (
        <Section title={t('deckViewer.draw')} subtitle={t('cardCount', { count: drawPile.length })}>
          <PileTop cards={nextCards} stackCount={drawPile.length - nextCards.length} row />
        </Section>
      )}

      {gameState.phase === Phase.PLAYING && gameState.board.length > 0 && (
        <RaiseOnDrag>
          <TutorialTarget id="board">
            <Section
              title={t('sections.tableau')}
              subtitle={`${t('cardCount', { count: gameState.board.length })}`}
              action={zoomControls}
            >
              <CardRow cardIds={gameState.board} zoom={zoom} />
            </Section>
          </TutorialTarget>
        </RaiseOnDrag>
      )}

      {gameState.phase === Phase.PLAYING && gameState.board.length === 0 && (
        <EmptyState
          title={t('endturn.title', { turn: gameState.turn + 1 })}
          action={
            <Button onPress={endTurnVoluntary} color="primary" size="md">
              {t('endturn.start')}
            </Button>
          }
        />
      )}

      {isBoardPhase && permanents.length > 0 && (
        <RaiseOnDrag>
          <Section
            title={t('sections.permanents')}
            subtitle={t('cardCount', { count: permanents.length })}
          >
            <CardRow cardIds={permanents} zoom={zoom} />
          </Section>
        </RaiseOnDrag>
      )}

      {isBoardPhase && goals.length > 0 && (
        <RaiseOnDrag>
          <Section title={t('sections.goals')} subtitle={t('cardCount', { count: goals.length })}>
            <CardRow cardIds={goals} zoom={zoom} />
          </Section>
        </RaiseOnDrag>
      )}

      {[Phase.PLAYING, Phase.TURN_END, Phase.ROUND_END].includes(gameState.phase) &&
        Object.keys(gameState.triggerPile).length === 0 &&
        gameState.lastAddedCards.length > 0 &&
        displayNewCards &&
        (hasStateChoice ? (
          <Modal
            title={t('cardAdded.title', { count: gameState.lastAddedCards.length })}
            onClose={() => setDisplayNewCards(false)}
          >
            <NewCardSelection cardIds={gameState.lastAddedCards} chooseState={chooseState} />
          </Modal>
        ) : (
          <CardViewerModal
            cardIds={gameState.lastAddedCards}
            initialId={gameState.lastAddedCards[0]}
            title={t('cardAdded.title', { count: gameState.lastAddedCards.length })}
            onClose={() => setDisplayNewCards(false)}
          />
        ))}
    </View>
  );
}
