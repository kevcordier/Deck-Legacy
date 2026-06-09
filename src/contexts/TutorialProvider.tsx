import { TutorialArrow } from '@components/Tutorial/TutorialArrow';
import { TutorialBeacon } from '@components/Tutorial/TutorialBeacon';
import { TutorialTooltip } from '@components/Tutorial/TutorialTooltip';
import { TutorialContext } from '@contexts/TutorialContext';
import { Phase } from '@engine/domain/enums';
import { renderTextWithIcons } from '@helpers/renderHelpers';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ACTIONS, EVENTS, type EventData, STATUS, type Step, useJoyride } from 'react-joyride';

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const { t } = useTranslation();
  const { gameState, startGame } = useGame();
  const { tutorialEnabled, setTutorialEnabled } = useGameUI();

  const steps = useMemo<Step[]>(
    () => [
      {
        target: '[data-tour="game"]',
        content: t('tutorial.welcome'),
        placement: 'center',
      },
      {
        target: '[data-tour="game"]',
        content: t('tutorial.goal'),
        placement: 'center',
      },
      {
        target: '[data-tour="main-board"]',
        content: t('tutorial.interface.board'),
        placement: 'center',
      },
      {
        target: '[data-tour="draw-column"]',
        content: t('tutorial.interface.drawColumn'),
        placement: 'right',
      },
      {
        target: '[data-tour="draw-mobile-button"]',
        content: t('tutorial.interface.drawColumn'),
        placement: 'top',
      },
      {
        target: '[data-tour="discard-column"]',
        content: t('tutorial.interface.discardColumn'),
        placement: 'left',
      },
      {
        target: '[data-tour="discard-mobile-button"]',
        content: t('tutorial.interface.discardColumn'),
        placement: 'top',
      },
      {
        target: '[data-tour="destroyed-button-desktop"]',
        content: t('tutorial.interface.destroyedButton'),
        placement: 'left',
      },
      {
        target: '[data-tour="destroyed-button-mobile"]',
        content: t('tutorial.interface.destroyedButton'),
        placement: 'top',
      },
      {
        target: '[data-tour="header"]',
        content: t('tutorial.interface.header'),
      },
      {
        target: '[data-tour="resource-bar"]',
        content: t('tutorial.interface.resourceBar'),
        blockTargetInteraction: false,
      },
      {
        target: '[data-tour="sticker-stock-button"]',
        content: t('tutorial.interface.stickerStock'),
        blockTargetInteraction: false,
        placement: 'bottom',
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-number"]',
        content: t('tutorial.setup.uniqueNumber'),
      },
      {
        target: '[data-tour="draw-mobile-button"]',
        content: t('tutorial.setup.startingDeck'),
        buttons: ['skip'],
        blockTargetInteraction: false,
      },
      {
        target: '[data-tour="draw-viewer-open"]',
        content: t('tutorial.setup.startingDeck'),
        buttons: ['skip'],
        blockTargetInteraction: false,
      },
      {
        target: '[data-tour="modal-mobile-deck-viewer-content"] [data-tour="draw-viewer-open"]',
        content: t('tutorial.setup.startingDeck'),
        buttons: ['skip'],
        blockTargetInteraction: false,
      },
      {
        target: '[data-tour="deck-viewer"]',
        content: t('tutorial.setup.startingDeck2'),
        blockTargetInteraction: false,
        placement: 'left',
      },
      {
        target: '[data-tour="modal-draw-close"]',
        content: t('tutorial.setup.startingDeck3'),
        blockTargetInteraction: false,
        buttons: ['skip'],
      },
      {
        target: '[data-tour="modal-mobile-deck-viewer-close"]',
        content: t('tutorial.setup.startingDeck3'),
        blockTargetInteraction: false,
        buttons: ['skip'],
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-root"]',
        content: t('tutorial.cardAnatomy.overview'),
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-number"]',
        content: t('tutorial.cardAnatomy.number'),
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-name"]',
        content: t('tutorial.cardAnatomy.name'),
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-state-preview"]',
        content: t('tutorial.cardAnatomy.statePreview'),
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-tags"]',
        content: t('tutorial.cardAnatomy.tags'),
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-production"]',
        content: t('tutorial.cardAnatomy.production'),
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-action"]',
        content: renderTextWithIcons(t('tutorial.cardAnatomy.action')),
        placement: 'auto',
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-upgrade"]',
        content: t('tutorial.cardAnatomy.upgrade'),
      },
      {
        target: '[data-tour="game"]',
        content: t('tutorial.gameplay.roundFlow'),
        placement: 'center',
      },
      {
        target: '[data-tour="game"]',
        content: t('tutorial.gameplay.availableActions'),
        placement: 'center',
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-production"]',
        content: t('tutorial.gameplay.production'),
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-state-preview"]',
        content: t('tutorial.gameplay.stickerCap'),
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-upgrade"]',
        content: t('tutorial.gameplay.upgrade'),
      },
      {
        target: '[data-tour="main-board"] [data-tour="card-action"]',
        content: t('tutorial.gameplay.cardActions'),
      },
      {
        target: '[data-tour="progress"]',
        content: t('tutorial.gameplay.progress'),
      },
      {
        target: '[data-tour="progress-mobile"]',
        content: t('tutorial.gameplay.progress'),
      },
      {
        target: '[data-tour="end-turn-voluntary"]',
        content: t('tutorial.gameplay.endTurnVoluntary'),
      },
      {
        target: '[data-tour="end-turn-voluntary-mobile"]',
        content: t('tutorial.gameplay.endTurnVoluntary'),
      },
      {
        target: '[data-tour="rules-button"]',
        content: t('tutorial.end'),
        placement: 'left',
        blockTargetInteraction: false,
      },
    ],
    [t],
  );

  const { Tour } = useJoyride({
    beaconComponent: TutorialBeacon,
    continuous: true,
    options: {
      skipScroll: true,
      blockTargetInteraction: true,
      overlayClickAction: false,
      buttons: ['skip', 'primary'],
    },
    run:
      gameState.phase !== Phase.PRE_GAME && gameState.phase !== Phase.GAME_OVER && tutorialEnabled,
    scrollToFirstStep: true,
    stepIndex,
    steps,
    tooltipComponent: TutorialTooltip,
    arrowComponent: TutorialArrow,
    onEvent: ({ action, index, status, type }: EventData) => {
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setTutorialEnabled(false);
        startGame();
        return;
      }

      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
        setStepIndex(Math.max(0, nextStepIndex));
      }
    },
  });

  const value = useMemo(
    () => ({
      stepIndex,
      run:
        tutorialEnabled &&
        gameState.phase !== Phase.PRE_GAME &&
        gameState.phase !== Phase.GAME_OVER,
      nextStep: () => setStepIndex(prev => Math.min(prev + 1, steps.length - 1)),
      prevStep: () => setStepIndex(prev => Math.max(prev - 1, 0)),
    }),
    [stepIndex, tutorialEnabled, gameState.phase, setStepIndex, steps],
  );

  return (
    <TutorialContext value={value}>
      {children} {Tour}
    </TutorialContext>
  );
};
