import { CardNumber } from '@components/CardNumber/CardNumber';
import {
  CardStateTooltip,
  cardTextTokens,
  selfUpgradeStateId,
} from '@components/CardStateTooltip/CardStateTooltip';
import { Glory } from '@components/ui/Glory/Glory';
import { AsteriskIcon, DestroyIcon, UpgradeIcon } from '@components/ui/Icon/icon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { Text } from '@components/ui/Text/Text';
import { ActionEffectType } from '@deck-legacy/engine/domain/enums';
import type {
  ActionEffect,
  CardInstance,
  StepDef,
  TrackDef,
} from '@deck-legacy/engine/domain/types';
import { tCardTrackAction } from '@helpers/cardI18n';
import { getResMeta } from '@helpers/renderHelpers';
import type { TFunction } from 'i18next';
import React, { type JSX } from 'react';
import { useTranslation } from 'react-i18next';
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

export function CardTrackContent({
  t,
  instance,
  track,
  step,
  isValidated,
  wide = false,
  renderCard,
}: {
  t: TFunction;
  instance: CardInstance;
  track: TrackDef;
  step: StepDef;
  isValidated: boolean;
  wide?: boolean;
  renderCard?: (instance: CardInstance) => React.ReactNode;
}): React.ReactNode[] {
  const contents: React.ReactNode[] = [];
  const actions = step.effects ?? [];

  const getResourceContent = (resKey: string, amount: number, actionId: number): JSX.Element[] => {
    const meta = getResMeta(resKey);
    return Array.from({ length: amount })
      .map((_, i) =>
        meta.icon ? (
          <meta.icon
            className="size-3"
            color={meta.color}
            alt={resKey}
            key={`${actionId}-${i.toString()}`}
          />
        ) : null,
      )
      .filter(Boolean) as JSX.Element[];
  };

  const getActionContent = (action: ActionEffect): JSX.Element | null => {
    if (action.type === ActionEffectType.DISCOVER_CARD && action.cards?.ids?.[0] !== undefined) {
      const discoveredId = action.cards.ids[0];
      const label = <CardNumber instanceId={discoveredId} className="text-xs" />;
      return renderCard ? (
        <CardStateTooltip key={action.id} instanceId={discoveredId} renderCard={renderCard}>
          {label}
        </CardStateTooltip>
      ) : (
        <React.Fragment key={action.id}>{label}</React.Fragment>
      );
    }

    if (action.type === ActionEffectType.UPGRADE_CARD) {
      const icon = <UpgradeIcon className="size-3" />;
      const targetStateId = selfUpgradeStateId([action]);
      return renderCard && targetStateId !== undefined ? (
        <CardStateTooltip
          key={action.id}
          instanceId={instance.id}
          stateId={targetStateId}
          renderCard={renderCard}
        >
          {icon}
        </CardStateTooltip>
      ) : (
        <React.Fragment key={action.id}>{icon}</React.Fragment>
      );
    }

    if (action.type === ActionEffectType.DESTROY_CARD) {
      return <DestroyIcon key={action.id} className="size-3" color={IconColors.tagEnemy} />;
    }

    if (action.resources) {
      const resKeys =
        Object.entries(action.resources).filter(([k]) => !['choice', 'cards'].includes(k)) ?? [];
      return (
        <View className="flex-row flex-wrap justify-center" key={action.id}>
          {resKeys.map(([k, v]) => getResourceContent(k, Number(v), action.id))}
        </View>
      );
    }

    if (action.value && step.icon === 'glory') {
      return (
        <Glory key={action.id} glory={action.value} className="size-5" textClassName="text-xs" />
      );
    }

    if (step.icon === '*') {
      return <AsteriskIcon key={action.id} className="text-ink-card size-4" />;
    }

    return null;
  };

  if (track.inverse) {
    contents.push(
      <Text
        key={step.id}
        className={`font-body-bold leading-none ${wide ? 'text-sm' : 'text-[9px]'}`}
      >
        {tCardTrackAction(
          t,
          instance.cardId,
          instance.stateId,
          step.id,
          cardTextTokens(instance.id, step.effects, renderCard),
        )}
      </Text>,
    );
  } else {
    actions.forEach(action => {
      contents.push(getActionContent(action));
    });
    // The check only marks a validated step that shows no icon of its own.
    if (isValidated && !contents.some(Boolean)) {
      contents.push(
        <Text key="validated" className="text-success">
          ✓
        </Text>,
      );
    }
  }

  return contents;
}

interface CardTrackContentProps {
  readonly instance: CardInstance;
  readonly track: TrackDef;
  readonly step: StepDef;
  readonly isValidated: boolean;
  readonly wide?: boolean;
  readonly renderCard?: (instance: CardInstance) => React.ReactNode;
}

export function CardTrackStep({
  step,
  track,
  instance,
  isValidated,
  wide = false,
  renderCard,
}: CardTrackContentProps) {
  const { t } = useTranslation();
  const contents = CardTrackContent({ t, instance, track, step, isValidated, wide, renderCard });
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
  const contentNode = <View className="items-center justify-center">{contents}</View>;
  let boxSize = 'size-8';
  if (track.vertical) boxSize = wide ? 'size-6' : 'size-5';

  return (
    <View
      className={`items-center gap-0.5 ${track.vertical ? 'flex-row-reverse justify-end' : 'justify-center'}`}
    >
      <View className="flex-row items-center gap-0.5">
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
      {track.steps.map(step => (
        <CardTrackStep
          key={step.id}
          step={step}
          track={track}
          instance={instance}
          wide={wide}
          isValidated={validatedSteps.includes(step.id)}
          renderCard={renderCard}
        />
      ))}
    </View>
  );
}
