import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { Checkbox } from '@components/ui/Checkbox/Checkbox';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { GameUIContext } from '@contexts/GameUIContext';
import { canUseOptions } from '@deck-legacy/engine/application/gameStateHelper';
import { Options, Phase } from '@deck-legacy/engine/domain/enums';
import type { GameState } from '@deck-legacy/engine/domain/types/GameState';
import { use, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

interface GamePhaseActionsProps {
  readonly gameState: GameState;
  readonly deckEmpty: boolean;
  readonly haveChoiceToDo: boolean;
  readonly parameters: { advanceCardDrawn: number; displayedDrawDeckCards: number };
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
  const { resourceWarningEnabled, setResourceWarningEnabled } = use(GameUIContext);
  const [confirmingProgress, setConfirmingProgress] = useState(false);
  const [dontRemind, setDontRemind] = useState(false);

  // Drawing a card empties the resources: warn first, unless the player turned the warning off.
  const hasResources = Object.values(gameState.resources).some(v => v > 0);
  const handleProgress = () => {
    if (hasResources && resourceWarningEnabled) setConfirmingProgress(true);
    else progress();
  };
  const closeWarning = () => {
    if (dontRemind) setResourceWarningEnabled(false);
    setConfirmingProgress(false);
  };
  const confirmProgress = () => {
    closeWarning();
    progress();
  };

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
        {confirmingProgress && (
          <Modal
            title={t('progressWarning.title')}
            onClose={closeWarning}
            footer={
              <View className="flex-row justify-end gap-2">
                <Button variant="outlined" size="sm" onPress={closeWarning}>
                  {t('progressWarning.cancel')}
                </Button>
                <Button color="primary" size="sm" onPress={confirmProgress}>
                  {t('progressWarning.confirm')}
                </Button>
              </View>
            }
          >
            <Text>{t('progressWarning.message')}</Text>
            <Checkbox
              label={t('progressWarning.dontRemind')}
              checked={dontRemind}
              onChange={setDontRemind}
            />
          </Modal>
        )}
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
    gameState.isLastRound,
    gameState.drawPile.length,
    t,
    startTurn,
    endRound,
    startRound,
  );

  if (!action) return null;

  return (
    <View className={`flex-row items-center ${gapClass}`}>
      <Button onPress={action.onPress} variant="outlined" size={size}>
        {action.label}
      </Button>
    </View>
  );
}
