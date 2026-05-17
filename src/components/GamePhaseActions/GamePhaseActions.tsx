import { Button } from '@components/ui/Button/Button';
import { canUseOptions } from '@engine/application/gameStateHelper';
import { Options } from '@engine/domain/enums';
import type { GameState } from '@engine/domain/types/GameState';
import { Phase } from '@engine/domain/types/Phase';
import { useTranslation } from 'react-i18next';

interface GamePhaseActionsProps {
  gameState: GameState;
  deckEmpty: boolean;
  haveChoiceToDo: boolean;
  parameters: { advanceCardDrawn: number; displayedDrawDeckCards: number };
  progress: () => void;
  endTurnVoluntary: () => void;
  startTurn: () => void;
  endRound: () => void;
  startRound: () => void;
  variant?: 'desktop' | 'mobile';
}

interface PhaseAction {
  label: string;
  onClick: () => void;
}

function getPhaseAction(
  phase: Phase,
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
        onClick: startTurn,
      };
    case Phase.TURN_END:
      return drawPileLength > 0
        ? {
            label: t('endturn.start'),
            onClick: startTurn,
          }
        : {
            label: t('endround.end'),
            onClick: endRound,
          };
    case Phase.ROUND_END:
      return {
        label: t('roundpreview.start'),
        onClick: startRound,
      };
    default:
      return null;
  }
}

function renderActionGroup(
  content: React.ReactNode,
  containerClass: string,
  gapClass: string,
): React.ReactNode {
  return <div className={`${containerClass} items-center ${gapClass}`}>{content}</div>;
}

interface PlayingPhaseProps {
  deckEmpty: boolean;
  haveChoiceToDo: boolean;
  cantAdvance: boolean;
  drawPileLength: number;
  progress: () => void;
  endTurnVoluntary: () => void;
  t: ReturnType<typeof useTranslation>['t'];
  sizeClass: 'xs' | 'sm';
  isDesktop: boolean;
  containerClass: string;
  gapClass: string;
  advanceCardDrawn: number;
}

function renderPlayingPhase({
  deckEmpty,
  haveChoiceToDo,
  cantAdvance,
  drawPileLength,
  progress,
  endTurnVoluntary,
  t,
  sizeClass,
  isDesktop,
  containerClass,
  gapClass,
  advanceCardDrawn,
}: PlayingPhaseProps): React.ReactNode {
  const drawCount = Math.min(isDesktop ? advanceCardDrawn : 2, drawPileLength);

  return renderActionGroup(
    <>
      <Button
        onClick={progress}
        disabled={deckEmpty || haveChoiceToDo || cantAdvance}
        variant="outlined"
        size={sizeClass}
        data-tour={isDesktop ? 'progress' : 'progress-mobile'}
      >
        <span className={isDesktop ? 'hidden lg:inline' : ''}>›› </span>
        {isDesktop ? t('header.progress') : ''}
        {deckEmpty ? '' : ` (${drawCount})`}
      </Button>
      <Button
        onClick={endTurnVoluntary}
        disabled={haveChoiceToDo}
        variant="outlined"
        size={sizeClass}
        data-tour={isDesktop ? 'end-turn-voluntary' : 'end-turn-voluntary-mobile'}
      >
        {t('header.endTurn')}
      </Button>
    </>,
    containerClass,
    gapClass,
  );
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

  const isDesktop = variant === 'desktop';
  const gapClass = isDesktop ? 'gap-2' : 'gap-1';
  const sizeClass: 'xs' | 'sm' = isDesktop ? 'xs' : 'sm';
  const containerClass = isDesktop ? 'hidden lg:flex' : 'flex';

  const cantAdvance = !canUseOptions(gameState, Options.ADVANCE);

  if (gameState.phase === Phase.PLAYING) {
    return renderPlayingPhase({
      deckEmpty,
      haveChoiceToDo,
      cantAdvance,
      drawPileLength: gameState.drawPile.length,
      progress,
      endTurnVoluntary,
      t,
      sizeClass,
      isDesktop,
      containerClass,
      gapClass,
      advanceCardDrawn: parameters.advanceCardDrawn,
    });
  }

  const action = getPhaseAction(
    gameState.phase,
    gameState.drawPile.length,
    t,
    startTurn,
    endRound,
    startRound,
  );

  if (action) {
    return renderActionGroup(
      <Button onClick={action.onClick} variant="outlined" size={sizeClass}>
        {action.label}
      </Button>,
      containerClass,
      gapClass,
    );
  }

  return null;
}
