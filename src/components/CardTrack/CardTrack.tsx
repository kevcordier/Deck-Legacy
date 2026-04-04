import React from 'react';
import { getResMeta } from '@engine/application/resourceHelpers';
import { canAffordResources } from '@engine/application/cardHelpers';
import { ActionType } from '@engine/domain/enums';
import type { TrackDef, Resources } from '@engine/domain/types';
// import './CardTrack.css';
import { GloryIcon } from '@components/Icon';

interface CardTrackProps {
  track: TrackDef;
  validatedSteps: number[];
  currentResources: Resources;
  canActivate: boolean;
  onStep: (stepId: number) => void;
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
    <div className="ct">
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
        const firstAction = actions[0];

        let content: React.ReactNode = null;
        if (glory !== undefined && glory !== 0) {
          content = (
            <span className="ct-step-glory">
              +{glory}
              <GloryIcon className="ct-step-glory-icon" alt="glory" />
            </span>
          );
        } else if (firstAction) {
          if (
            firstAction.type === ActionType.DISCOVER_CARD &&
            firstAction.cards?.ids?.[0] !== undefined
          ) {
            content = <span className="ct-step-discover">#{firstAction.cards.ids[0]}</span>;
          } else if (firstAction.type === ActionType.UPGRADE_CARD) {
            content = <span className="ct-step-upgrade">↑</span>;
          } else if (firstAction.type === ActionType.ADD_RESOURCES && firstAction.resources) {
            const [resKey] =
              Object.entries(firstAction.resources).filter(([k]) => k !== 'choice')[0] ?? [];
            if (resKey) {
              const meta = getResMeta(resKey);
              content = meta.icon ? (
                <meta.icon className={`res-icon ${meta.cls} res-sm`} alt={resKey} />
              ) : null;
            }
          }
        }

        return (
          <div key={step.id} className="ct-step-wrap">
            {costEntry && (
              <div className="ct-step-cost">
                {Object.entries(costEntry).map(([k, v]) => {
                  const meta = getResMeta(k);
                  return (
                    <React.Fragment key={k}>
                      {v}
                      {meta.icon && <meta.icon className={`res-icon ${meta.cls} res-xs`} alt={k} />}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
            <button
              className={[
                'ct-step-btn',
                isValidated ? 'ct-step-btn--done' : '',
                !isClickable && !isValidated ? 'ct-step-btn--locked' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={!isClickable}
              onClick={() => onStep(step.id)}
              title={isValidated ? '✓' : undefined}
            >
              {isValidated ? <span className="ct-step-check">✓</span> : content}
            </button>
          </div>
        );
      })}
    </div>
  );
}
