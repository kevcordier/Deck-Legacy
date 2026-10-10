import { Text } from '@components/ui/Text/Text';
import { TutorialContext, type TutorialStep } from '@contexts/TutorialContext';
import { Phase } from '@deck-legacy/engine/domain/enums';
import { renderTextWithIcons } from '@helpers/renderHelpers';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { View } from 'react-native';

type TargetRef = React.RefObject<View | null>;

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [modalDepths, setModalDepths] = useState<number[]>([]);
  const targetsRef = useRef(new Map<string, TargetRef>());
  const { t } = useTranslation();
  const { gameState, isTutorial, startGame } = useGame();
  const { setTutorialEnabled } = useGameUI();

  // Target ids are the former `data-tour` attributes. Steps whose target is not rendered
  // (e.g. desktop-only elements on mobile) are skipped automatically.
  const steps = useMemo<TutorialStep[]>(
    () => [
      { target: null, content: t('tutorial.welcome'), placement: 'center' },
      { target: null, content: t('tutorial.goal'), placement: 'center' },
      { target: null, content: t('tutorial.interface.board'), placement: 'center' },
      { target: 'draw-column', content: t('tutorial.interface.drawColumn') },
      { target: 'draw-mobile-button', content: t('tutorial.interface.drawColumn') },
      { target: 'discard-column', content: t('tutorial.interface.discardColumn') },
      { target: 'discard-mobile-button', content: t('tutorial.interface.discardColumn') },
      { target: 'destroyed-button-desktop', content: t('tutorial.interface.destroyedButton') },
      { target: 'destroyed-button-mobile', content: t('tutorial.interface.destroyedButton') },
      { target: 'header', content: t('tutorial.interface.header') },
      { target: 'resource-bar', content: t('tutorial.interface.resourceBar') },
      { target: 'sticker-stock-button', content: t('tutorial.interface.stickerStock') },
      { target: 'card-number', content: t('tutorial.setup.uniqueNumber') },
      {
        target: 'draw-mobile-button',
        content: t('tutorial.setup.startingDeck'),
        buttons: ['skip'],
      },
      {
        target: 'draw-viewer-open',
        content: t('tutorial.setup.startingDeck'),
        buttons: ['skip'],
      },
      { target: 'deck-viewer', content: t('tutorial.setup.startingDeck2') },
      {
        target: 'modal-draw-close',
        content: t('tutorial.setup.startingDeck3'),
        buttons: ['skip'],
      },
      {
        target: 'modal-mobile-deck-viewer-close',
        content: t('tutorial.setup.startingDeck3'),
        buttons: ['skip'],
      },
      { target: 'card-root', content: t('tutorial.cardAnatomy.overview') },
      { target: 'card-number', content: t('tutorial.cardAnatomy.number') },
      { target: 'card-name', content: t('tutorial.cardAnatomy.name') },
      { target: 'card-state-preview', content: t('tutorial.cardAnatomy.statePreview') },
      { target: 'card-tags', content: t('tutorial.cardAnatomy.tags') },
      { target: 'card-production', content: t('tutorial.cardAnatomy.production') },
      {
        target: 'card-action',
        content: <Text>{renderTextWithIcons(t('tutorial.cardAnatomy.action'))}</Text>,
      },
      { target: 'card-upgrade', content: t('tutorial.cardAnatomy.upgrade') },
      { target: null, content: t('tutorial.gameplay.roundFlow'), placement: 'center' },
      { target: null, content: t('tutorial.gameplay.availableActions'), placement: 'center' },
      { target: 'card-production', content: t('tutorial.gameplay.production') },
      { target: 'card-state-preview', content: t('tutorial.gameplay.stickerCap') },
      { target: 'card-upgrade', content: t('tutorial.gameplay.upgrade') },
      { target: 'card-action', content: t('tutorial.gameplay.cardActions') },
      { target: 'progress', content: t('tutorial.gameplay.progress') },
      { target: 'progress-mobile', content: t('tutorial.gameplay.progress') },
      { target: 'end-turn-voluntary', content: t('tutorial.gameplay.endTurnVoluntary') },
      { target: 'end-turn-voluntary-mobile', content: t('tutorial.gameplay.endTurnVoluntary') },
      { target: 'rules-button', content: t('tutorial.end') },
    ],
    [t],
  );

  const run =
    isTutorial && gameState.phase !== Phase.PRE_GAME && gameState.phase !== Phase.GAME_OVER;

  // Keep the latest callbacks without invalidating the memoized context functions.
  const finishRef = useRef(() => {});
  useEffect(() => {
    finishRef.current = () => {
      setTutorialEnabled(false);
      startGame();
    };
  });

  const stepCount = steps.length;
  const stepIndexRef = useRef(stepIndex);
  const goToStep = useCallback((index: number) => {
    stepIndexRef.current = index;
    setStepIndex(index);
  }, []);
  const nextStep = useCallback(() => {
    if (stepIndexRef.current >= stepCount - 1) {
      finishRef.current();
      return;
    }
    goToStep(stepIndexRef.current + 1);
  }, [stepCount, goToStep]);
  const prevStep = useCallback(() => goToStep(Math.max(stepIndexRef.current - 1, 0)), [goToStep]);
  const skip = useCallback(() => finishRef.current(), []);

  const registerTarget = useCallback((id: string, ref: TargetRef) => {
    targetsRef.current.set(id, ref);
  }, []);
  const unregisterTarget = useCallback((id: string, ref: TargetRef) => {
    if (targetsRef.current.get(id) === ref) targetsRef.current.delete(id);
  }, []);
  const getTarget = useCallback((id: string) => targetsRef.current.get(id), []);

  const registerModal = useCallback((depth: number) => {
    setModalDepths(prev => [...prev, depth]);
    return () =>
      setModalDepths(prev => {
        const index = prev.lastIndexOf(depth);
        return index === -1 ? prev : [...prev.slice(0, index), ...prev.slice(index + 1)];
      });
  }, []);
  const topModalDepth = modalDepths.length > 0 ? Math.max(...modalDepths) : 0;

  const value = useMemo(
    () => ({
      stepIndex,
      run,
      steps,
      nextStep,
      prevStep,
      skip,
      registerTarget,
      unregisterTarget,
      getTarget,
      topModalDepth,
      registerModal,
    }),
    [
      stepIndex,
      run,
      steps,
      nextStep,
      prevStep,
      skip,
      registerTarget,
      unregisterTarget,
      getTarget,
      topModalDepth,
      registerModal,
    ],
  );

  return <TutorialContext value={value}>{children}</TutorialContext>;
};
