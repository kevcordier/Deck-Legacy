import { type ChoiceSectionProps, buildCardCostResolution } from './shared';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { Text } from '@components/ui/Text/Text';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export function ChooseCardSection(props: Readonly<ChoiceSectionProps>) {
  const {
    choice,
    instances,
    defs,
    selectedIds,
    onToggleId,
    isMultiSelect,
    resolvePlayerChoice,
    resolvePayCost,
  } = props;
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const handleCardPress = (instanceId: number) => {
    if (isMultiSelect) {
      onToggleId(instanceId);
      return;
    }
    if (choice.kind === 'COST') {
      resolvePayCost(buildCardCostResolution(choice, [instanceId]));
      return;
    }
    resolvePlayerChoice(
      {
        id: choice.id,
        type: choice.kind,
        sourceInstanceId: choice.sourceInstanceId,
        instanceIds: [instanceId],
      },
      choice.type,
    );
  };

  return (
    // Fixed card width: a grid sizes its cells from the modal, which itself shrinks to few cards.
    <View className="flex-row flex-wrap justify-center gap-2 p-2 lg:gap-4">
      {choice.choices.map((id, index) => {
        if (typeof id !== 'number') return null;
        const inst = instances[id];
        const def = inst ? defs[inst.cardId] : undefined;
        if (!def || !inst) return null;
        const isSelected = isMultiSelect && selectedIds.includes(id);
        return (
          <View
            key={`${id}-${index.toString()}`}
            className={`${isDesktop ? 'w-72' : 'w-[48%]'} max-w-full items-stretch gap-3 p-2`}
          >
            <View
              className={`rounded-2xl border-4 p-1 ${isSelected ? 'border-primary bg-primary/30 shadow-lg' : 'border-transparent'}`}
            >
              <GameCard instance={inst} />
              {isSelected && (
                <View className="bg-primary absolute -right-3 -top-3 size-10 items-center justify-center rounded-full border-2 border-white shadow-md">
                  <Text className="text-xl font-bold text-white">✓</Text>
                </View>
              )}
            </View>
            <Button
              onPress={() => handleCardPress(id)}
              color={isSelected ? 'danger' : 'primary'}
              variant={isSelected ? 'outlined' : 'contained'}
              accessibilityState={{ selected: isSelected }}
            >
              {t(isSelected ? 'pendingChoice.deselect' : 'pendingChoice.select')}
            </Button>
          </View>
        );
      })}
    </View>
  );
}
