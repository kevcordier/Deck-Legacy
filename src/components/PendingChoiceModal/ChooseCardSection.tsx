import { type ChoiceSectionProps, buildCardCostResolution } from './shared';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { useTranslation } from 'react-i18next';

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

  const handleCardClick = (instanceId: number) => {
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 p-2">
      {choice.choices.map((id, index) => {
        if (typeof id !== 'number') return null;
        const inst = instances[id];
        const def = inst ? defs[inst.cardId] : undefined;
        if (!def || !inst) return null;
        const isSelected = isMultiSelect && selectedIds.includes(id);
        return (
          <div
            key={`${id}-${index.toString()}`}
            className="flex flex-col items-stretch gap-2 p-2 @container min-w-60"
          >
            <GameCard
              instance={inst}
              className={`relative ${isSelected ? ' ring-primary rounded-xl ring-2' : ''}`}
            />
            <Button onClick={() => handleCardClick(id)}>{t('pendingChoice.select')}</Button>
          </div>
        );
      })}
    </div>
  );
}
