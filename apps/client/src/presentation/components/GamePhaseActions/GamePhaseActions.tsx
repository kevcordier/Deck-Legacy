import { type ResourceWarningKind, ResourceWarningModal } from './ResourceWarningModal';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { GameUIContext } from '@contexts/GameUIContext';
import { hasActionToSpendResources } from '@deck-legacy/engine/domain/cards/hasActionToSpendResources';
import { Options, Phase } from '@deck-legacy/engine/domain/enums';
import { canUseOptions } from '@deck-legacy/engine/domain/state/canUseOptions';
import { isLastRound } from '@deck-legacy/engine/domain/state/isLastRound';
import type { GameParameters, GameState } from '@deck-legacy/engine/domain/types/GameState';
import { useGame } from '@hooks/useGame';
import { use, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

interface GamePhaseActionsProps {
  readonly gameState: GameState;
  readonly deckEmpty: boolean;
  readonly haveChoiceToDo: boolean;
  readonly parameters: GameParameters;
  readonly progress: () => void;
  readonly endTurnVoluntary: () => void;
  readonly startTurn: () => void;
  readonly endRound: () => void;
  readonly startRound: () => void;
  readonly variant?: 'desktop' | 'mobile';
}

interface PhaseAction {
  label: string;
  onPress: () => void;
}

function getPhaseAction(
  phase: Phase,
  isLastRound: boolean,
  drawPileLength: number,
  t: ReturnType<typeof useTranslation>['t'],
  startTurn: () => void,
  endRound: () => void,
  startRound: () => void,
): PhaseAction | null {
  switch (phase) {
    case Phase.ROUND_START:
      return {
        label: t('roundpreview.start'),
        onPress: startTurn,
      };
    case Phase.TURN_END:
      return drawPileLength > 0
        ? {
            label: t('endturn.start'),
            onPress: startTurn,
          }
        : {
            label: t('endround.end'),
            onPress: endRound,
          };
    case Phase.ROUND_END:
      return {
        label: isLastRound ? t('lastRound.end') : t('roundpreview.start'),
        onPress: isLastRound ? endRound : startRound,
      };
    default:
      return null;
  }
}

export function GamePhaseActions({
  gameState,
  deckEmpty,
  haveChoiceToDo,
  parameters,
  progress,
  endTurnVoluntary,
  startTurn,
  endRound,
  startRound,
  variant = 'desktop',
}: GamePhaseActionsProps) {
  const { t } = useTranslation();
  const { resourceWarningEnabled } = use(GameUIContext);
  const { defs, stickerDefs } = useGame();
  // The move waiting for the player to confirm the warning: progressing, or leaving the turn.
  const [pendingMove, setPendingMove] = useState<{
    kind: ResourceWarningKind;
    run: () => void;
  } | null>(null);

  const confirmFirst = (kind: ResourceWarningKind, run: () => void) => {
    if (resourceWarningEnabled) setPendingMove({ kind, run });
    else run();
  };
  // Drawing a card empties the resources: warn first, unless the player turned the warning off.
  const hasResources = Object.values(gameState.resources).some(v => v > 0);
  const handleProgress = () => (hasResources ? confirmFirst('progress', progress) : progress());
  // Leaving the turn or the round loses the resources a card in play could still use.
  const handlePhaseAction = (run: () => void) =>
    hasActionToSpendResources(gameState, defs, stickerDefs) ? confirmFirst('action', run) : run();

  const warningModal = pendingMove && (
    <ResourceWarningModal
      kind={pendingMove.kind}
      onCancel={() => setPendingMove(null)}
      onConfirm={() => {
        setPendingMove(null);
        pendingMove.run();
      }}
    />
  );

  const isDesktop = variant === 'desktop';
  const gapClass = isDesktop ? 'gap-2' : 'gap-1';
  const size = isDesktop ? 'xs' : 'sm';

  if (gameState.phase === Phase.PLAYING) {
    const cantAdvance = !canUseOptions(gameState, Options.ADVANCE);
    const drawCount = Math.min(
      isDesktop ? parameters.advanceCardDrawn : 2,
      gameState.drawPile.length,
    );
    const countLabel = deckEmpty ? '' : ` (${drawCount})`;
    const progressLabel = `›› ${isDesktop ? t('header.progress') : ''}${countLabel}`;

    return (
      <View className={`flex-row items-center ${gapClass}`}>
        <TutorialTarget id={isDesktop ? 'progress' : 'progress-mobile'}>
          <Button
            onPress={handleProgress}
            disabled={deckEmpty || haveChoiceToDo || cantAdvance}
            variant="outlined"
            size={size}
          >
            {progressLabel}
          </Button>
        </TutorialTarget>
        {warningModal}
        <TutorialTarget id={isDesktop ? 'end-turn-voluntary' : 'end-turn-voluntary-mobile'}>
          <Button
            onPress={endTurnVoluntary}
            disabled={haveChoiceToDo}
            variant="outlined"
            size={size}
          >
            {t('header.endTurn')}
          </Button>
        </TutorialTarget>
      </View>
    );
  }

  const action = getPhaseAction(
    gameState.phase,
    isLastRound(gameState, parameters),
    gameState.drawPile.length,
    t,
    startTurn,
    endRound,
    startRound,
  );

  if (!action) return null;

  return (
    <View className={`flex-row items-center ${gapClass}`}>
      <Button onPress={() => handlePhaseAction(action.onPress)} variant="outlined" size={size}>
        {action.label}
      </Button>
      {warningModal}
    </View>
  );
}
