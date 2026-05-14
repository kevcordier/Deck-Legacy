import { Button } from '@components/ui/Button/Button';
import { useTranslation } from 'react-i18next';
import type { TooltipRenderProps } from 'react-joyride';

export function TutorialTooltip({
  closeProps,
  index,
  isLastStep,
  primaryProps,
  skipProps,
  step,
  tooltipProps,
}: Readonly<TooltipRenderProps>) {
  const { t } = useTranslation();
  const showSkip = !isLastStep && step.buttons.includes('skip');
  const showPrimary = step.buttons.includes('primary');
  const showClose = step.buttons.includes('close');
  const tooltipStyle = {
    width: 'min(calc(100vw - 1rem), 24rem)',
    maxWidth: 'calc(100vw - 1rem)',
    maxHeight: 'min(80vh, 36rem)',
  };

  return (
    <div
      data-joyride-step={index}
      className="animate-fade-in-scale overflow-hidden overscroll-contain rounded-2xl border-2 border-primary/70 bg-card text-ink shadow-[0_20px_50px_rgba(74,50,19,0.24)] dark:border-dark-primary/70 dark:bg-dark-background dark:text-dark-ink"
      {...(step.id && { 'data-joyride-id': step.id })}
      {...tooltipProps}
      style={tooltipStyle}
    >
      <div className="relative overflow-y-auto px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-primary/18 to-transparent dark:from-dark-primary/14" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-primary/30 bg-primary/12 px-2.5 py-1 font-display text-xs tracking-[0.18em] text-primary uppercase dark:border-dark-primary/40 dark:bg-dark-primary/10 dark:text-dark-primary">
                {t('tutorial.tooltip.badge')}
              </span>
            </div>

            {step.title ? (
              <h4 className="font-display text-xl font-semibold text-primary dark:text-dark-primary">
                {step.title}
              </h4>
            ) : null}
          </div>

          {showClose ? (
            <button
              type="button"
              className="shrink-0 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 font-display text-xs tracking-[0.16em] text-ink uppercase transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-dark-border dark:bg-dark-background/70 dark:text-dark-ink dark:hover:border-dark-primary dark:hover:text-dark-primary dark:focus-visible:ring-dark-primary"
              {...closeProps}
            >
              {t('tutorial.tooltip.close')}
            </button>
          ) : null}
        </div>

        <div className="relative mt-4 text-base leading-6 text-ink dark:text-dark-ink sm:text-lg">
          {step.content}
        </div>

        <div className="relative mt-6 flex flex-col gap-3 border-t border-border/70 pt-4 dark:border-dark-border sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            {showSkip ? (
              <Button
                variant="text"
                color="ink"
                size="sm"
                font="body"
                className="w-full justify-center tracking-[0.08em] uppercase sm:w-auto"
                {...skipProps}
              >
                {t('tutorial.tooltip.skip')}
              </Button>
            ) : null}
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {showPrimary ? (
              <Button
                variant="contained"
                color="primary"
                size="sm"
                className="w-full justify-center sm:w-auto"
                {...primaryProps}
              >
                {isLastStep ? t('tutorial.tooltip.finish') : t('tutorial.tooltip.next')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
