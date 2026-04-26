import { Glory } from '@components/ui/Glory/Glory';
import { ActionEffectType } from '@engine/domain/enums';
import type { ActionEffect, CardInstance, StepDef, TrackDef } from '@engine/domain/types';
import { tCardTrackAction } from '@helpers/cardI18n';
import { getResMeta } from '@helpers/renderHelpers';
import type { TFunction } from 'i18next';
import React, { type JSX } from 'react';
import { useTranslation } from 'react-i18next';

interface CardTrackProps {
  readonly instance: CardInstance;
  readonly track: TrackDef;
  readonly validatedSteps: number[];
}

export function CardTrackContent({
  t,
  instance,
  track,
  step,
}: {
  t: TFunction;
  instance: CardInstance;
  track: TrackDef;
  step: StepDef;
}): React.ReactNode[] {
  const contents: React.ReactNode[] = [];
  const actions = step.effects ?? [];

  const getResourceContent = (resKey: string, amount: number, actionId: number): JSX.Element[] => {
    const meta = getResMeta(resKey);
    return Array.from({ length: amount })
      .map((_, i) =>
        meta.icon ? (
          <meta.icon
            className={`${meta.cls} size-3`}
            alt={resKey}
            key={`${actionId}-${i.toString()}`}
          />
        ) : null,
      )
      .filter(Boolean) as JSX.Element[];
  };

  const getActionContent = (action: ActionEffect): JSX.Element | null => {
    if (action.type === ActionEffectType.DISCOVER_CARD && action.cards?.ids?.[0] !== undefined) {
      return <span key={action.id}>#{action.cards.ids[0]}</span>;
    }

    if (action.type === ActionEffectType.UPGRADE_CARD) {
      return <span key={action.id}>⬆</span>;
    }

    if (action.resources) {
      const resKeys =
        Object.entries(action.resources).filter(([k]) => !['choice', 'cards'].includes(k)) ?? [];
      return (
        <div key={action.id}>
          {resKeys.map(([k, v]) => getResourceContent(k, Number(v), action.id))}
        </div>
      );
    }

    if (action.accumulated && step.icon === 'glory') {
      return <Glory key={action.id} glory={action.accumulated} size="xs" />;
    }

    if (action.accumulated) {
      return (
        <span className="font-display font-bold text-xs" key={action.id}>
          {action.accumulated}
        </span>
      );
    }

    return (
      <span className="font-display font-bold text-3xl" key={action.id}>
        *
      </span>
    );
  };

  if (track.inverse) {
    contents.push(
      <span key={step.id} className="font-display font-bold text-xs">
        {tCardTrackAction(t, instance.cardId, instance.stateId, step.id)}
      </span>,
    );
  } else {
    actions.forEach(action => {
      contents.push(getActionContent(action));
    });
  }

  return contents;
}

export function CardTrack({ instance, track, validatedSteps }: CardTrackProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`flex ${track.vertical ? 'flex-col' : 'flex-row'} justify-center flex-wrap gap-0.5`}
    >
      {track.steps.map(step => {
        const isValidated = validatedSteps.includes(step.id);

        // Determine step button content
        const contents = CardTrackContent({ t, instance, track, step });
        let cost: React.ReactNode[] = [];

        if (step.cost?.resources) {
          const costEntry = step.cost?.resources?.[0];
          cost = Object.entries(costEntry).map(([k, v]) => {
            const meta = getResMeta(k);
            return (
              <React.Fragment key={k}>
                {v}
                {meta.icon && <meta.icon className={`${meta.cls} size-4`} alt={k} />}
              </React.Fragment>
            );
          });
        }
        if (step.cost?.accumulated) {
          cost.push(step.cost.accumulated.toString());
        }

        return (
          <div
            key={step.id}
            className={`flex ${track.vertical ? 'flex-row-reverse justify-end' : 'flex-col justify-center'} items-center gap-1`}
          >
            {cost && (
              <div className={`flex items-center gap-0.5 text-base text-base-ink`}>
                {track.inverse ? contents : cost}
              </div>
            )}
            <div
              className={[
                `${track.vertical ? 'size-7' : 'size-10'} shrink-0 text-base flex flex-col items-center justify-center border-2 leading-none font-bold rounded-md text-base-ink bg-card border-base-ink`,
                isValidated ? 'border-success bg-success/20! text-success' : '',
              ].join(' ')}
              title={isValidated ? '✓' : undefined}
            >
              {track.inverse ? cost : contents}
            </div>
          </div>
        );
      })}
    </div>
  );
}
