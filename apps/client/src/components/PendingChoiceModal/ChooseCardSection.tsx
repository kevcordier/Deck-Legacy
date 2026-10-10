import { type ChoiceSectionProps, buildCardCostResolution } from './shared';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { Grid } from '@components/ui/Grid/Grid';
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
    <Grid minItemWidth={240} maxColumns={4} className="p-2">
      {choice.choices.map((id, index) => {
        if (typeof id !== 'number') return null;
        const inst = instances[id];
        const def = inst ? defs[inst.cardId] : undefined;
        if (!def || !inst) return null;
        const isSelected = isMultiSelect && selectedIds.includes(id);
        return (
          <View key={`${id}-${index.toString()}`} className="items-stretch gap-2 p-2">
            <View
              className={`rounded-xl border-2 ${isSelected ? 'border-primary' : 'border-transparent'}`}
            >
              <GameCard instance={inst} />
            </View>
            <Button onPress={() => handleCardPress(id)}>{t('pendingChoice.select')}</Button>
          </View>
        );
      })}
    </Grid>
  );
}
