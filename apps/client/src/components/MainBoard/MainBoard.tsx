import { type BoardZoomLevel, CardRow } from '@components/CardRow/CardRow';
import {
  CardUpgradeFlip,
  CardUpgradeReveal,
} from '@components/CardUpgradeReveal/CardUpgradeReveal';
import { CardViewerModal } from '@components/CardViewerModal/CardViewerModal';
import { GameCard } from '@components/GameCard/GameCard';
import { MiniGameCard } from '@components/MiniGameCard/MiniGameCard';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { ZoomInIcon, ZoomOutIcon } from '@components/ui/Icon/icon';
import { MarkdownText } from '@components/ui/MarkdownText/MarckdownText';
import { Modal } from '@components/ui/Modal/Modal';
import { Section } from '@components/ui/Section/Section';
import { getActiveState } from '@deck-legacy/engine/application/cardHelpers';
import { CardTag, Phase } from '@deck-legacy/engine/domain/enums';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { tCardName, tCardParchmentText } from '@helpers/cardI18n';
import type { UpgradeReveal } from '@helpers/upgradeReveal';
import { useGame } from '@hooks/useGame';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, useWindowDimensions } from 'react-native';

const MIN_ZOOM: BoardZoomLevel = 0;
const MAX_ZOOM: BoardZoomLevel = 2;

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
  // Three cards per row on desktop; two mini cards on phones, where a tap opens the card in large.
  const itemClass = isDesktop ? 'w-[31%] max-w-80' : 'w-[48%] max-w-56';
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

/** Width of the upgraded card shown in the turn transition panel (mini card on phones). */
const TURN_END_CARD_WIDTH = 240;
/** Horizontal room around the card on phones: page and panel paddings. */
const TURN_END_PHONE_MARGINS = 72;

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
    upgradeReveal,
    dismissUpgradeReveal,
    defs,
    parchmentTextPending,
    dismissParchmentText,
  } = useGame();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const { width: windowWidth } = useWindowDimensions();
  const [zoom, setZoom] = useState<BoardZoomLevel>(1);
  // The reveal whose card is open in large: a new upgrade never reopens the viewer.
  const [viewedUpgrade, setViewedUpgrade] = useState<UpgradeReveal | null>(null);

  // An upgrade ends the turn: its card turns over inside the turn transition panel, where the
  // end of turn can still be undone, instead of in a modal on top of it.
  const isTurnEnd = gameState.phase === Phase.TURN_END;
  const turnEndUpgrade = isTurnEnd && upgradeReveal && (
    <CardUpgradeFlip
      key={`${upgradeReveal.after.id}-${upgradeReveal.after.stateId}`}
      before={upgradeReveal.before}
      after={upgradeReveal.after}
      width={Math.min(TURN_END_CARD_WIDTH, windowWidth - TURN_END_PHONE_MARGINS)}
      mini={!isDesktop}
      onPress={isDesktop ? undefined : () => setViewedUpgrade(upgradeReveal)}
    />
  );

  const goals = gameState.permanents.filter(
    c => getActiveState(gameState.instances[c], defs)?.tags?.includes(CardTag.GOAL) ?? false,
  );
  const permanents = gameState.permanents.filter(c => !goals.includes(c));

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

  const isBoardPhase = [Phase.PLAYING, Phase.TURN_END].includes(gameState.phase);

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
        >
          {turnEndUpgrade}
        </EmptyState>
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
        >
          {turnEndUpgrade}
        </EmptyState>
      )}

      {gameState.phase === Phase.ROUND_END && !gameState.isLastRound && (
        <EmptyState
          title={t('roundpreview.title', { round: gameState.round })}
          action={
            <Button onPress={startRound} color="primary" size="md">
              {t('roundpreview.start')}
            </Button>
          }
        />
      )}

      {gameState.phase === Phase.ROUND_END && gameState.isLastRound && (
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

      {gameState.phase === Phase.PLAYING && gameState.board.length > 0 && (
        <TutorialTarget id="board">
          <Section
            title={t('sections.tableau')}
            subtitle={`${t('cardCount', { count: gameState.board.length })}`}
            action={zoomControls}
          >
            <CardRow cardIds={gameState.board} zoom={zoom} />
          </Section>
        </TutorialTarget>
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
        <Section
          title={t('sections.permanents')}
          subtitle={t('cardCount', { count: permanents.length })}
        >
          <CardRow cardIds={permanents} zoom={zoom} />
        </Section>
      )}

      {isBoardPhase && goals.length > 0 && (
        <Section title={t('sections.goals')} subtitle={t('cardCount', { count: goals.length })}>
          <CardRow cardIds={goals} zoom={zoom} />
        </Section>
      )}

      {[Phase.PLAYING, Phase.TURN_END, Phase.ROUND_END].includes(gameState.phase) &&
        Object.keys(gameState.triggerPile).length === 0 &&
        gameState.lastAddedCards.length > 0 &&
        displayNewCards && (
          <Modal
            title={t('cardAdded.title', { count: gameState.lastAddedCards.length })}
            onClose={() => setDisplayNewCards(false)}
          >
            <NewCardSelection cardIds={gameState.lastAddedCards} chooseState={chooseState} />
          </Modal>
        )}

      {turnEndUpgrade && upgradeReveal && viewedUpgrade === upgradeReveal && (
        <CardViewerModal
          cardIds={[upgradeReveal.after.id]}
          initialId={upgradeReveal.after.id}
          onClose={() => setViewedUpgrade(null)}
        />
      )}

      {upgradeReveal && !isTurnEnd && (
        <CardUpgradeReveal
          key={`${upgradeReveal.after.id}-${upgradeReveal.after.stateId}`}
          before={upgradeReveal.before}
          after={upgradeReveal.after}
          onClose={dismissUpgradeReveal}
        />
      )}
    </View>
  );
}
