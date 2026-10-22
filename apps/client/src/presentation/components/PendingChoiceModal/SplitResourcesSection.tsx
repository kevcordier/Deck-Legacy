import type { ChoiceSectionProps } from './ChoiceSectionProps';
import { Button } from '@components/ui/Button/Button';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import { Text } from '@components/ui/Text/Text';
import type { Resources } from '@deck-legacy/engine/domain/types';
import { useState } from 'react';
import { View } from 'react-native';

/** "Spend N resources of any types": the player splits the total among the resources they have. */
export function SplitResourcesSection({ choice, t, resolvePayCost }: Readonly<ChoiceSectionProps>) {
  const available = (choice.choices[0] ?? {}) as Resources;
  const total = choice.total ?? 0;
  const [split, setSplit] = useState<Record<string, number>>({});
  const paid = Object.values(split).reduce((sum, amount) => sum + amount, 0);

  const change = (type: string, delta: number) =>
    setSplit(current => ({ ...current, [type]: (current[type] ?? 0) + delta }));

  return (
    <View className="gap-3">
      {Object.entries(available).map(([type, max]) => {
        const count = split[type] ?? 0;
        return (
          <View key={type} className="flex-row items-center justify-center gap-2">
            <ResourcePill resource={type} className="size-8" />
            <Button
              variant="outlined"
              className="size-11"
              disabled={count <= 0}
              onPress={() => change(type, -1)}
              accessibilityLabel={t('pendingChoice.split.less', {
                resource: t(`resources.${type}`),
              })}
            >
              ‹
            </Button>
            <Text className="font-body-bold w-16 text-center text-2xl">
              {count} / {max}
            </Text>
            <Button
              variant="outlined"
              className="size-11"
              disabled={count >= (max ?? 0) || paid >= total}
              onPress={() => change(type, 1)}
              accessibilityLabel={t('pendingChoice.split.more', {
                resource: t(`resources.${type}`),
              })}
            >
              ›
            </Button>
          </View>
        );
      })}
      <Button
        disabled={paid !== total}
        onPress={() =>
          resolvePayCost({
            resources: Object.fromEntries(Object.entries(split).filter(([, n]) => n > 0)),
            discardedCardIds: [],
            destroyedCardIds: [],
          })
        }
      >
        {t('pendingChoice.split.confirm', { paid, total })}
      </Button>
    </View>
  );
}
