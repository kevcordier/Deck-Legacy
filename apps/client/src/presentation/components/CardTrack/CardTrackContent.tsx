import { CardNumber } from '@components/CardNumber/CardNumber';
import { cardTextTokens } from '@components/CardStateTooltip/cardTextTokens';
import { Glory } from '@components/ui/Glory/Glory';
import { getResMeta } from '@components/ui/Icon/getResMeta';
import { IconColors } from '@components/ui/Icon/iconColors';
import { AsteriskIcon } from '@components/ui/Icon/icons/AsteriskIcon';
import { DestroyIcon } from '@components/ui/Icon/icons/DestroyIcon';
import { UpgradeIcon } from '@components/ui/Icon/icons/UpgradeIcon';
import { Text } from '@components/ui/Text/Text';
import { ActionEffectType } from '@deck-legacy/engine/domain/enums';
import type {
  ActionEffect,
  CardInstance,
  StepDef,
  TrackDef,
} from '@deck-legacy/engine/domain/types';
import { tCardTrackAction } from '@i18n/card/tCardTrackAction';
import type { TFunction } from 'i18next';
import React, { type JSX } from 'react';
import { View } from 'react-native';

export function CardTrackContent({
  t,
  instance,
  track,
  step,
  isValidated,
  wide = false,
}: {
  t: TFunction;
  instance: CardInstance;
  track: TrackDef;
  step: StepDef;
  isValidated: boolean;
  wide?: boolean;
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
      return <CardNumber key={action.id} instanceId={action.cards.ids[0]} className="text-xs" />;
    }

    if (action.type === ActionEffectType.UPGRADE_CARD) {
      return <UpgradeIcon key={action.id} className="size-3" />;
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
      <Text key={step.id} className={`font-body leading-none ${wide ? 'text-sm' : 'text-[9px]'}`}>
        {tCardTrackAction(
          t,
          instance.cardId,
          instance.stateId,
          step.id,
          cardTextTokens(step.effects),
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
