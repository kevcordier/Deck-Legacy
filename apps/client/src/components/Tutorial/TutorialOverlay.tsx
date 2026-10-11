import { TutorialTooltip } from '@components/Tutorial/TutorialTooltip';
import {
  ModalDepthContext,
  TutorialContext,
  type TutorialContextProps,
} from '@contexts/TutorialContext';
import { use, useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

type Rect = { x: number; y: number; width: number; height: number };

const MARGIN = 8;
const HIGHLIGHT_PADDING = 4;
const TOOLTIP_MAX_WIDTH = 384;
const ESTIMATED_TOOLTIP_HEIGHT = 260;
const MEASURE_INTERVAL_MS = 500;
const MISSING_TARGET_DELAY_MS = 400;
const NO_POINTER = { pointerEvents: 'none' } as const;
const BLOCK_POINTER = { pointerEvents: 'auto' } as const;

function useTargetRect(
  { getTarget, scrollBy }: Pick<TutorialContextProps, 'getTarget' | 'scrollBy'>,
  targetId: string | null,
  windowHeight: number,
) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!targetId) return;

    let cancelled = false;
    const measure = () => {
      const ref = getTarget(targetId);
      if (!ref?.current) {
        setRect(null);
        return;
      }
      ref.current.measureInWindow((x, y, width, height) => {
        if (cancelled) return;
        setRect(width > 0 && height > 0 ? { x, y, width, height } : null);
        // The backdrop blocks scrolling: bring a target out of the screen to its middle (a
        // target taller than the screen, like the whole board, is left where it is).
        if (height > 0 && height < windowHeight && (y < 0 || y + height > windowHeight)) {
          scrollBy(y + height / 2 - windowHeight / 2);
        }
      });
    };

    const firstMeasure = setTimeout(measure, 0);
    const interval = setInterval(measure, MEASURE_INTERVAL_MS);
    const missingTimeout = setTimeout(() => {
      const ref = getTarget(targetId);
      if (!ref?.current) setMissing(true);
      else
        ref.current.measureInWindow((_x, _y, width, height) => {
          if (!cancelled && (width === 0 || height === 0)) setMissing(true);
        });
    }, MISSING_TARGET_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(firstMeasure);
      clearInterval(interval);
      clearTimeout(missingTimeout);
    };
  }, [getTarget, scrollBy, targetId, windowHeight]);

  return { rect, missing };
}

/**
 * Blocks every press while a step is shown; `actionable`: the highlighted element can be pressed
 * (the player must do the step's action).
 */
function Backdrop({
  rect,
  actionable,
}: {
  readonly rect: Rect | null;
  readonly actionable: boolean;
}) {
  if (!rect) {
    return <View style={BLOCK_POINTER} className="absolute inset-0 z-50 bg-black/40" />;
  }
  const top = Math.max(0, rect.y - HIGHLIGHT_PADDING);
  const left = Math.max(0, rect.x - HIGHLIGHT_PADDING);
  const width = rect.width + HIGHLIGHT_PADDING * 2;
  const height = rect.height + HIGHLIGHT_PADDING * 2;

  return (
    <>
      <View
        className="absolute inset-x-0 top-0 z-50 bg-black/40"
        style={[BLOCK_POINTER, { height: top }]}
      />
      <View
        className="absolute inset-x-0 bottom-0 z-50 bg-black/40"
        style={[BLOCK_POINTER, { top: top + height }]}
      />
      <View
        className="absolute left-0 z-50 bg-black/40"
        style={[BLOCK_POINTER, { top, height, width: left }]}
      />
      <View
        className="absolute right-0 z-50 bg-black/40"
        style={[BLOCK_POINTER, { top, height, left: left + width }]}
      />
      <View
        className="border-primary absolute z-50 rounded-lg border-2"
        style={[actionable ? NO_POINTER : BLOCK_POINTER, { top, left, width, height }]}
      />
    </>
  );
}

function TutorialStepView({ tutorial }: { readonly tutorial: TutorialContextProps }) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const step = tutorial.steps[tutorial.stepIndex];
  const targetId = step?.placement === 'center' ? null : (step?.target ?? null);
  const { rect, missing } = useTargetRect(tutorial, targetId, windowHeight);

  const { skipStep } = tutorial;
  useEffect(() => {
    // Same behaviour as react-joyride's TARGET_NOT_FOUND: move on to the next step.
    if (missing) skipStep();
  }, [missing, skipStep]);

  if (!step || (targetId && !rect)) return null;

  const tooltipWidth = Math.min(windowWidth - MARGIN * 2, TOOLTIP_MAX_WIDTH);
  let position: { top?: number; bottom?: number; left: number };
  if (!rect) {
    position = {
      top: Math.max(MARGIN, (windowHeight - ESTIMATED_TOOLTIP_HEIGHT) / 2),
      left: (windowWidth - tooltipWidth) / 2,
    };
  } else if (step.placement === 'top') {
    position = {
      top: rect.y + MARGIN,
      left: Math.min(
        Math.max(MARGIN, rect.x + rect.width / 2 - tooltipWidth / 2),
        windowWidth - tooltipWidth - MARGIN,
      ),
    };
  } else {
    const spaceBelow = windowHeight - (rect.y + rect.height);
    const left = Math.min(
      Math.max(MARGIN, rect.x + rect.width / 2 - tooltipWidth / 2),
      windowWidth - tooltipWidth - MARGIN,
    );
    const spaceAbove = rect.y;
    const spaceRight = windowWidth - (rect.x + rect.width);
    const sideTop = Math.min(
      Math.max(MARGIN, rect.y + rect.height / 2 - ESTIMATED_TOOLTIP_HEIGHT / 2),
      windowHeight - ESTIMATED_TOOLTIP_HEIGHT - MARGIN,
    );
    if (spaceBelow > ESTIMATED_TOOLTIP_HEIGHT) {
      position = { top: rect.y + rect.height + MARGIN * 2, left };
    } else if (spaceAbove > ESTIMATED_TOOLTIP_HEIGHT) {
      position = { bottom: windowHeight - rect.y + MARGIN * 2, left };
    } else if (rect.x > tooltipWidth + MARGIN * 2) {
      // Tall target (e.g. a side column): place the tooltip beside it.
      position = { top: sideTop, left: rect.x - tooltipWidth - MARGIN * 2 };
    } else if (spaceRight > tooltipWidth + MARGIN * 2) {
      position = { top: sideTop, left: rect.x + rect.width + MARGIN * 2 };
    } else {
      // Target as large as the screen: the tooltip goes to the bottom edge, over less of it.
      position = { bottom: MARGIN, left: (windowWidth - tooltipWidth) / 2 };
    }
  }

  return (
    // No full-screen wrapper: on the web it would catch every press (`box-none` is not applied).
    <>
      <Backdrop rect={rect} actionable={step.done !== undefined || step.interactive === true} />
      <View className="absolute z-50" style={{ ...position, width: tooltipWidth }}>
        <TutorialTooltip
          step={step}
          isLastStep={tutorial.stepIndex === tutorial.steps.length - 1}
          onNext={tutorial.nextStep}
          onBack={tutorial.canGoBack ? tutorial.prevStep : undefined}
          onSkip={tutorial.skip}
          onFinish={tutorial.finish}
        />
      </View>
    </>
  );
}

/**
 * Renders the current tutorial step. Mounted at the app root and inside every modal: only the
 * instance living in the topmost modal renders, so the tooltip is never hidden behind a modal.
 */
export function TutorialOverlay() {
  const tutorial = use(TutorialContext);
  const depth = use(ModalDepthContext);
  if (!tutorial?.run || tutorial.topModalDepth !== depth) return null;
  // Keyed by step so the measurement state starts fresh for every step.
  return <TutorialStepView key={tutorial.stepIndex} tutorial={tutorial} />;
}
