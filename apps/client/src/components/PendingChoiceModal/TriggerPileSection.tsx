import { CardNumber } from '@components/CardNumber/CardNumber';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { TriggerIcon } from '@components/ui/Icon/icon';
import { Text } from '@components/ui/Text/Text';
import type { CardDef, CardInstance, TriggerEntry } from '@deck-legacy/engine/domain/types';
import { tCardActionLabel, tCardName } from '@helpers/cardI18n';
import { useIsDesktop } from '@hooks/useIsDesktop';
import type { TFunction } from 'i18next';
import { View } from 'react-native';

type TriggerPileSectionProps = {
  triggerPile: Record<string, TriggerEntry>;
  defs: Record<number, CardDef>;
  instances: Record<number, CardInstance>;
  t: TFunction;
  onResolveTrigger: (sourceInstanceId: number, actionId: string, triggerId: string) => void;
  onSkipTrigger: (uuid: string) => void;
};

export function TriggerPileSection({
  triggerPile,
  defs,
  instances,
  t,
  onResolveTrigger,
  onSkipTrigger,
}: Readonly<TriggerPileSectionProps>) {
  const isDesktop = useIsDesktop();
  return (
    <View className="flex-row flex-wrap justify-center gap-2 lg:gap-4">
      {Object.entries(triggerPile).map(([triggerId, trigger]) => {
        const inst = instances[trigger.sourceInstanceId];
        const def = inst ? defs[inst.cardId] : undefined;
        const state =
          def?.states.find(candidate => candidate.id === inst?.stateId) ?? def?.states[0];
        if (!inst || !def || !state) return null;
        const cardName = tCardName(t, state?.name || '');
        const actionLabel = tCardActionLabel(t, `${trigger.effectDef.id}`, inst.cumulated);

        return (
          <View key={triggerId} className={`${isDesktop ? 'w-64' : 'w-[48%]'} items-center gap-2`}>
            <View className="w-full flex-row items-start gap-3">
              <TriggerIcon
                className="mt-1 size-8 shrink-0"
                color={trigger.effectDef.optional ? 'yellow' : 'red'}
              />
              <View className="flex-1">
                {!!cardName && (
                  <Text className="font-display text-primary mb-1 text-sm">
                    <CardNumber instanceId={trigger.sourceInstanceId} iconClassName="size-4" />{' '}
                    {cardName}
                  </Text>
                )}
                <Text className="font-display text-xs">{actionLabel}</Text>
              </View>
            </View>
            <GameCard instance={inst} hideStatePreview />
            <View className="flex-row flex-wrap items-end gap-2">
              <Button
                size="sm"
                color="base-primary"
                onPress={() =>
                  onResolveTrigger(trigger.sourceInstanceId, trigger.effectDef.id, triggerId)
                }
              >
                {t('triggerPile.resolve')}
              </Button>
              {trigger.effectDef.optional && (
                <Button
                  size="sm"
                  variant="outlined"
                  color="ink"
                  onPress={() => onSkipTrigger(triggerId)}
                >
                  {t('triggerPile.skip')}
                </Button>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
