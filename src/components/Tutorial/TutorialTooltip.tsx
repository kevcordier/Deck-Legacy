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

  return (
    <div
      data-joyride-step={index}
      className="animate-fade-in-scale overflow-hidden rounded-2xl border-2 border-primary/70 bg-card text-ink shadow-[0_20px_50px_rgba(74,50,19,0.24)] dark:border-dark-primary/70 dark:bg-dark-background dark:text-dark-ink"
      {...(step.id && { 'data-joyride-id': step.id })}
      {...tooltipProps}
    >
      <div className="relative max-w-sm px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
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

        <div className="relative mt-4 font-body text-lg leading-6 text-ink dark:text-dark-ink">
          {step.content}
        </div>

        <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4 dark:border-dark-border">
          <div>
            {showSkip ? (
              <Button
                variant="text"
                color="ink"
                size="sm"
                font="body"
                className="tracking-[0.08em] uppercase"
                {...skipProps}
              >
                {t('tutorial.tooltip.skip')}
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showPrimary ? (
              <Button variant="contained" color="primary" size="sm" {...primaryProps}>
                {isLastStep ? t('tutorial.tooltip.finish') : t('tutorial.tooltip.next')}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
