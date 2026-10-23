import { TutorialContext, type TutorialStep } from './TutorialContext';
import { renderTextWithIcons } from '@components/ui/Icon/renderTextWithIcons';
import { Text } from '@components/ui/Text/Text';
import { Phase } from '@deck-legacy/engine/domain/enums';
import type { GameState } from '@deck-legacy/engine/domain/types';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { HostInstance } from 'react-native';

type TargetRef = React.RefObject<HostInstance | null>;

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [modalDepths, setModalDepths] = useState<number[]>([]);
  const targetsRef = useRef(new Map<string, TargetRef>());
  const { t } = useTranslation();
  const { gameState, isTutorial, startGame, continueGame } = useGame();
  const { setTutorialEnabled } = useGameUI();

  // Steps whose target is not rendered (e.g. desktop-only elements on mobile) are skipped
  // automatically. The card ids follow `TUTORIAL_DRAW_ORDER`: turn 1 draws 5, 1, 2, 7; turn 2
  // draws 6, 3, 10, 8, then progress draws 4 and 9.
  const steps = useMemo<TutorialStep[]>(() => {
    const text = (key: string) => <Text>{renderTextWithIcons(t(key))}</Text>;
    const zoom = (zoomCardId: number, target: string, key: string): TutorialStep => ({
      target,
      zoomCardId,
      content: text(key),
    });
    const isDiscarded = (id: number) => (state: GameState) => state.discardPile.includes(id);
    const isUpgraded = (id: number) => (state: GameState) => state.instances[id]?.stateId !== 1;
    const produce = (id: number, key: string): TutorialStep[] => [
      open(id, isDiscarded(id)),
      { target: 'card-production', content: text(key), done: isDiscarded(id) },
    ];
    const upgrade = (id: number, key: string): TutorialStep[] => [
      open(id, isUpgraded(id)),
      { target: 'card-upgrade', content: text(key), done: isUpgraded(id) },
    ];
    const drewMore = (state: GameState) => state.board.includes(9);
    // The player opens the card on the board; the action is then done in the large card.
    const open = (id: number, done: (state: GameState) => boolean): TutorialStep => ({
      target: `card-${id}`,
      content: text('tutorial.openCard'),
      waitForTarget: `viewer-card-${id}`,
      done,
    });
    const onBoard = (id: number, key: string): TutorialStep => ({
      target: `card-${id}`,
      content: text(key),
    });

    return [
      { target: null, content: text('tutorial.welcome'), placement: 'center' },
      { target: null, content: text('tutorial.goal'), placement: 'center' },
      {
        target: 'modal-starting-deck-panel',
        content: text('tutorial.startingDeck.cards'),
        placement: 'top',
        interactive: true,
        showStartingDeck: true,
      },
      {
        target: 'modal-starting-deck-panel',
        content: text('tutorial.startingDeck.future'),
        placement: 'top',
        interactive: true,
        showStartingDeck: true,
      },
      { target: 'draw-column', content: text('tutorial.interface.draw') },
      { target: 'draw-mobile-button', content: text('tutorial.interface.draw') },
      { target: 'discard-button-desktop', content: text('tutorial.interface.discard') },
      { target: 'discard-mobile-button', content: text('tutorial.interface.discard') },
      { target: 'resource-bar', content: text('tutorial.interface.resourceBar') },
      { target: 'board', content: text('tutorial.turn1.hand') },
      zoom(7, 'card-root', 'tutorial.card.overview'),
      zoom(7, 'card-number', 'tutorial.card.number'),
      zoom(7, 'card-name', 'tutorial.card.name'),
      zoom(7, 'card-tags', 'tutorial.card.tags'),
      zoom(7, 'card-production', 'tutorial.card.production'),
      zoom(7, 'card-action', 'tutorial.card.action'),
      zoom(10, 'card-action', 'tutorial.card.actionCost'),
      zoom(10, 'card-action', 'tutorial.card.otherEffects'),
      zoom(7, 'card-upgrade', 'tutorial.card.upgrade'),
      zoom(7, 'card-state-preview', 'tutorial.card.statePreview'),
      onBoard(5, 'tutorial.turn1.objective'),
      ...produce(1, 'tutorial.turn1.produce'),
      ...produce(2, 'tutorial.turn1.produceAgain'),
      ...upgrade(5, 'tutorial.turn1.upgrade'),
      {
        target: 'phase-action',
        content: text('tutorial.turn1.next'),
        done: state => state.turn >= 2 && state.phase === Phase.PLAYING,
      },
      onBoard(6, 'tutorial.turn2.notEnough'),
      { target: 'progress', content: text('tutorial.turn2.progress'), done: drewMore },
      { target: 'progress-mobile', content: text('tutorial.turn2.progress'), done: drewMore },
      ...produce(3, 'tutorial.turn2.produce'),
      ...produce(9, 'tutorial.turn2.produceAgain'),
      ...upgrade(6, 'tutorial.turn2.upgrade'),
      {
        target: 'phase-action',
        content: text('tutorial.turn2.endRound'),
        done: state => state.round >= 2,
      },
      { target: 'round-preview', content: text('tutorial.discovery') },
      { target: null, content: text('tutorial.end'), placement: 'center', buttons: [] },
    ];
  }, [t]);

  const run =
    isTutorial && gameState.phase !== Phase.PRE_GAME && gameState.phase !== Phase.GAME_OVER;

  // Keep the latest callbacks without invalidating the memoized context functions.
  const finishRef = useRef((_keepGame: boolean) => {});
  useEffect(() => {
    finishRef.current = keepGame => {
      setTutorialEnabled(false);
      if (keepGame) continueGame();
      else startGame();
    };
  });

  const stepCount = steps.length;
  const stepIndexRef = useRef(stepIndex);
  // Steps actually shown before the current one: going back skips the steps without target.
  const [history, setHistory] = useState<number[]>([]);
  const historyRef = useRef(history);
  const goToStep = useCallback((index: number, nextHistory: number[]) => {
    stepIndexRef.current = index;
    historyRef.current = nextHistory;
    setStepIndex(index);
    setHistory(nextHistory);
  }, []);
  const moveForward = useCallback(
    (keepInHistory: boolean) => {
      const current = stepIndexRef.current;
      if (current >= stepCount - 1) {
        finishRef.current(false);
        return;
      }
      const past = historyRef.current;
      goToStep(current + 1, keepInHistory ? [...past, current] : past);
    },
    [stepCount, goToStep],
  );
  const nextStep = useCallback(() => moveForward(true), [moveForward]);
  const skipStep = useCallback(() => moveForward(false), [moveForward]);
  const prevStep = useCallback(() => {
    const past = historyRef.current;
    const last = past.at(-1);
    if (last !== undefined) goToStep(last, past.slice(0, -1));
  }, [goToStep]);
  // An action already done cannot be undone (no rewind in the tutorial): no way back past it.
  const lastIndex = history.at(-1);
  const previousStep = lastIndex === undefined ? undefined : steps[lastIndex];
  const canGoBack = previousStep !== undefined && previousStep.done === undefined;
  const skip = useCallback(() => finishRef.current(false), []);
  const finish = useCallback((keepGame: boolean) => finishRef.current(keepGame), []);

  // Action steps move on as soon as the player has done what they ask.
  const doneStep = run ? steps[stepIndex]?.done : undefined;
  useEffect(() => {
    if (doneStep?.(gameState)) nextStep();
  }, [doneStep, gameState, nextStep]);

  const registerTarget = useCallback(
    (id: string, ref: TargetRef) => {
      targetsRef.current.set(id, ref);
      if (steps[stepIndexRef.current]?.waitForTarget === id) nextStep();
    },
    [steps, nextStep],
  );
  const unregisterTarget = useCallback((id: string, ref: TargetRef) => {
    if (targetsRef.current.get(id) === ref) targetsRef.current.delete(id);
  }, []);
  const getTarget = useCallback((id: string) => targetsRef.current.get(id), []);

  const scrollerRef = useRef<((dy: number) => void) | null>(null);
  const registerScroller = useCallback((scroll: (dy: number) => void) => {
    scrollerRef.current = scroll;
    return () => {
      if (scrollerRef.current === scroll) scrollerRef.current = null;
    };
  }, []);
  const scrollBy = useCallback((dy: number) => scrollerRef.current?.(dy), []);

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
      skipStep,
      prevStep,
      canGoBack,
      skip,
      finish,
      registerTarget,
      unregisterTarget,
      getTarget,
      topModalDepth,
      registerModal,
      registerScroller,
      scrollBy,
    }),
    [
      stepIndex,
      run,
      steps,
      nextStep,
      skipStep,
      prevStep,
      canGoBack,
      skip,
      finish,
      registerTarget,
      unregisterTarget,
      getTarget,
      topModalDepth,
      registerModal,
      registerScroller,
      scrollBy,
    ],
  );

  return <TutorialContext value={value}>{children}</TutorialContext>;
};
