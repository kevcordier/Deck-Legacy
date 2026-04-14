import { Button } from '@components/ui/Button/Button';
import { Glory } from '@components/ui/Glory/Glory';
import { canAffordResources } from '@engine/application/cardHelpers';
import { ActionType } from '@engine/domain/enums';
import type { Resources, TrackDef } from '@engine/domain/types';
import { getResMeta } from '@helpers/renderHelpers';
import React from 'react';

interface CardTrackProps {
  readonly track: TrackDef;
  readonly validatedSteps: number[];
  readonly currentResources: Resources;
  readonly canActivate: boolean;
  readonly onStep: (stepId: number) => void;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function CardTrack({
  track,
  validatedSteps,
  currentResources,
  canActivate,
  onStep,
  size = 'md',
}: CardTrackProps) {
  const firstPendingId = track.inOrder
    ? track.steps.find(s => !validatedSteps.includes(s.id))?.id
    : undefined;

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      {track.steps.map(step => {
        const isValidated = validatedSteps.includes(step.id);
        const isClickable =
          canActivate &&
          !isValidated &&
          (!track.inOrder || step.id === firstPendingId) &&
          canAffordResources(currentResources, step.cost);

        const costEntry = step.cost.resources?.[0];

        // Determine step button content
        const glory = step.onClick.glory;
        const actions = step.onClick.actions ?? [];

        const contents: React.ReactNode[] = [];
        if (glory !== undefined && glory !== 0) {
          contents.push(
            <Glory
              key="glory"
              glory={glory}
              size={size === 'xs' || size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm'}
            />,
          );
        }
        actions.forEach((action, i) => {
          if (action.type === ActionType.DISCOVER_CARD && action.cards?.ids?.[0] !== undefined) {
            contents.push(<span key={i}>#{action.cards.ids[0]}</span>);
          } else if (action.type === ActionType.UPGRADE_CARD) {
            contents.push(<span key={i}>⬆</span>);
          } else if (action.type === ActionType.ADD_RESOURCES && action.resources) {
            const [resKey] =
              Object.entries(action.resources).filter(([k]) => k !== 'choice')[0] ?? [];
            if (resKey) {
              const meta = getResMeta(resKey);
              contents.push(
                meta.icon ? (
                  <meta.icon
                    className={`${meta.cls} ${size === 'xs' || size === 'sm' ? 'size-3' : size === 'lg' ? 'size-4' : 'size-5'}`}
                    alt={resKey}
                    key={i}
                  />
                ) : null,
              );
            }
          }
        });

        return (
          <div key={step.id} className="flex flex-col items-center gap-1">
            {costEntry && (
              <div
                className={`flex items-center gap-0.5 ${size === 'xs' || size === 'sm' ? 'text-xs' : 'text-base'} text-gray-500`}
              >
                {Object.entries(costEntry).map(([k, v]) => {
                  const meta = getResMeta(k);
                  return (
                    <React.Fragment key={k}>
                      {v}
                      {meta.icon && (
                        <meta.icon
                          className={`${meta.cls} ${size === 'xs' ? 'size-3' : size === 'sm' ? 'size-4' : size === 'lg' ? 'size-6' : 'size-4'}`}
                          alt={k}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
            <Button
              className={[
                `${size === 'xs' ? 'size-5' : size === 'sm' ? 'size-6' : size === 'lg' ? 'size-12' : 'size-10'} ${size === 'xs' || size === 'sm' ? 'text-xs' : 'text-base'} flex flex-col items-center justify-center rounded-sm border-2 border-gray-300 leading-none font-bold`,
                isValidated ? 'border-green-700 bg-green-700/20! text-green-700' : '',
              ].join(' ')}
              disabled={!isClickable && !isValidated}
              variant="text"
              onClick={() => onStep(step.id)}
              title={isValidated ? '✓' : undefined}
            >
              {isValidated ? <span>✓</span> : contents}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
