import { CardTrackContent } from './CardTrackContent';
import { getResMeta } from '@components/ui/Icon/getResMeta';
import { Text } from '@components/ui/Text/Text';
import type { CardInstance, StepDef, TrackDef } from '@deck-legacy/engine/domain/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

interface CardTrackContentProps {
  readonly instance: CardInstance;
  readonly track: TrackDef;
  readonly step: StepDef;
  readonly isValidated: boolean;
  readonly wide?: boolean;
}

export function CardTrackStep({
  step,
  track,
  instance,
  isValidated,
  wide = false,
}: CardTrackContentProps) {
  const { t } = useTranslation();
  const contents = CardTrackContent({ t, instance, track, step, isValidated, wide });
  let cost: React.ReactNode[] = [];

  if (step.cost?.resources) {
    const costEntry = step.cost?.resources?.[0];
    cost = Object.entries(costEntry).map(([k, v]) => {
      const meta = getResMeta(k);
      return (
        <React.Fragment key={k}>
          {v}
          {meta.icon && <meta.icon className="size-4" color={meta.color} alt={k} />}
        </React.Fragment>
      );
    });
  }
  if (step.cost?.accumulated) {
    cost.push(step.cost.accumulated.toString());
  }
  if (step.cost?.discard) {
    cost.push(step.cost.discard[0].pickNumber?.toString() ?? '');
  }

  if (track.inverse && isValidated) {
    cost = [
      <Text key="validated" className="text-success">
        ✓
      </Text>,
    ];
  }
  const textSize = wide ? 'text-sm' : 'text-xs';
  const costNode = <Text className={`text-ink-card ${textSize}`}>{cost}</Text>;
  const contentNode = <View className="shrink items-center justify-center">{contents}</View>;
  let boxSize = 'size-8';
  if (track.vertical) boxSize = wide ? 'size-6' : 'size-5';

  return (
    <View
      className={`shrink items-center gap-0.5 ${track.vertical ? 'flex-row-reverse justify-end' : 'justify-center'}`}
    >
      <View className="shrink flex-row items-center gap-0.5">
        {track.inverse ? contentNode : costNode}
      </View>
      <View
        accessibilityLabel={isValidated ? '✓' : undefined}
        className={`shrink-0 items-center justify-center rounded-md border-2 ${boxSize} ${isValidated ? 'border-success bg-success/20' : 'bg-card border-ink-card'}`}
      >
        {track.inverse ? costNode : contentNode}
      </View>
    </View>
  );
}
