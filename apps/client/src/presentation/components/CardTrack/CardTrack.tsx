import { CardTrackStep } from './CardTrackStep';
import { CardStateTooltip } from '@components/CardStateTooltip/CardStateTooltip';
import { previewTargets } from '@components/CardStateTooltip/previewTargets';
import type { CardInstance, TrackDef } from '@deck-legacy/engine/domain/types';
import React from 'react';
import { View } from 'react-native';

interface CardTrackProps {
  readonly instance: CardInstance;
  readonly track: TrackDef;
  readonly validatedSteps: number[];
  /** Roomier layout (large or wide cards). */
  readonly wide?: boolean;
  /** Renders the card previewed by the upgrade / discovery tooltips (none without it). */
  readonly renderCard?: (instance: CardInstance) => React.ReactNode;
}

export function CardTrack({
  instance,
  track,
  validatedSteps,
  wide = false,
  renderCard,
}: CardTrackProps) {
  let layoutClass = 'gap-0.5';
  if (!track.vertical) layoutClass = wide ? 'flex-row gap-1' : 'flex-row gap-0';

  return (
    <View className={`flex-wrap justify-center ${layoutClass}`}>
      {track.steps.map(step => {
        const stepNode = (
          <CardTrackStep
            key={step.id}
            step={step}
            track={track}
            instance={instance}
            wide={wide}
            isValidated={validatedSteps.includes(step.id)}
          />
        );
        const targets = previewTargets(instance.id, step.effects);
        return renderCard && targets.length > 0 ? (
          <CardStateTooltip
            key={step.id}
            targets={targets}
            renderCard={renderCard}
            className="shrink"
          >
            {stepNode}
          </CardStateTooltip>
        ) : (
          stepNode
        );
      })}
    </View>
  );
}
