import { Button } from '@components/ui/Button/Button';
import { Glory } from '@components/ui/Glory/Glory';
import { canAffordResources } from '@engine/application/cardHelpers';
import { ActionType } from '@engine/domain/enums';
import type { Action, Resources, TrackDef } from '@engine/domain/types';
import { getResMeta } from '@helpers/renderHelpers';
import React from 'react';

interface CardTrackProps {
  readonly track: TrackDef;
  readonly validatedSteps: number[];
  readonly currentResources: Resources;
  readonly canActivate: boolean;
  readonly onStep: (stepId: number) => void;
}

export function CardTrack({
  track,
  validatedSteps,
  currentResources,
  canActivate,
  onStep,
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
          contents.push(<Glory key="glory" glory={glory} size="sm" />);
        }

        const getActionContent = (action: Action) => {
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
        };

        actions.forEach(action => {
          contents.push(getActionContent(action));
        });

        return (
          <div key={step.id} className="flex flex-col items-center gap-1">
            {costEntry && (
              <div className={`flex items-center gap-0.5 text-base text-ink/50`}>
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
            <Button
              className={[
                `size-10 text-base flex flex-col items-center justify-center border-2 leading-none font-bold`,
                isValidated ? 'border-success bg-success/20! text-success' : '',
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
