import { Glory } from '@components/ui/Glory/Glory';
import { ActionType } from '@engine/domain/enums';
import type { ActionEffect, TrackDef } from '@engine/domain/types';
import { getResMeta } from '@helpers/renderHelpers';
import React from 'react';

interface CardTrackProps {
  readonly track: TrackDef;
  readonly validatedSteps: number[];
}

export function CardTrack({ track, validatedSteps }: CardTrackProps) {
  return (
    <div
      className={`flex ${track.vertical ? 'flex-col' : 'flex-row'} justify-start flex-wrap gap-2`}
    >
      {track.steps.map(step => {
        const isValidated = validatedSteps.includes(step.id);

        const costEntry = step.cost?.resources?.[0];

        // Determine step button content
        const glory = step.onAccess?.glory;
        const actions = step.onAccess?.actions ?? [];

        const contents: React.ReactNode[] = [];
        if (glory !== undefined && glory !== 0) {
          contents.push(<Glory key="glory" glory={glory} size="sm" />);
        }

        const getActionContent = (action: ActionEffect) => {
          if (action.type === ActionType.DISCOVER_CARD && action.cards?.ids?.[0] !== undefined) {
            return <span key={action.id}>#{action.cards.ids[0]}</span>;
          }

          if (action.type === ActionType.UPGRADE_CARD) {
            return <span key={action.id}>⬆</span>;
          }

          if (action.type === ActionType.ADD_RESOURCES && action.resources) {
            const [resKey] = Object.entries(action.resources).find(([k]) => k !== 'choice') ?? [];
            if (resKey) {
              const meta = getResMeta(resKey);
              return meta.icon ? (
                <meta.icon className={`${meta.cls} size-3`} alt={resKey} key={action.id} />
              ) : null;
            }
          }

          return (
            <span className="font-display font-bold text-3xl" key={action.id}>
              *
            </span>
          );
        };

        actions.forEach(action => {
          contents.push(getActionContent(action));
        });

        return (
          <div
            key={step.id}
            className={`flex ${track.vertical ? ' ' : 'flex-col '}items-center gap-1`}
          >
            {costEntry && (
              <div className={`flex items-center gap-0.5 text-base text-base-ink`}>
                {Object.entries(costEntry).map(([k, v]) => {
                  const meta = getResMeta(k);
                  return (
                    <React.Fragment key={k}>
                      {v}
                      {meta.icon && <meta.icon className={`${meta.cls} size-4`} alt={k} />}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
            <div
              className={[
                `size-10 text-base flex flex-col items-center justify-center border-2 leading-none font-bold rounded-md text-base-ink bg-card border-base-ink`,
                isValidated ? 'border-success bg-success/20! text-success' : '',
              ].join(' ')}
              title={isValidated ? '✓' : undefined}
            >
              {isValidated ? <span>✓</span> : contents}
            </div>
          </div>
        );
      })}
    </div>
  );
}
