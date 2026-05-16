import { type ChoiceSectionProps, makePreviewInstance } from './shared';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { useTranslation } from 'react-i18next';

export function ChooseStateSection(props: Readonly<ChoiceSectionProps>) {
  const { choice, instances, defs, resolvePlayerChoice } = props;
  const { t } = useTranslation();
  const sourceInst = instances[choice.sourceInstanceId];
  const cardDef = sourceInst ? defs[sourceInst.cardId] : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 p-2">
      {choice.choices.map(stateId => {
        if (typeof stateId !== 'number') return null;
        const state = cardDef?.states.find(candidate => candidate.id === stateId);
        if (!cardDef || !state) return null;
        return (
          <div key={stateId} className="flex flex-col items-stretch gap-2 p-2 @container min-w-60">
            <GameCard
              instance={makePreviewInstance(choice.sourceInstanceId, cardDef, state)}
              hideStatePreview
              className={`relative`}
            />
            <Button
              onClick={() =>
                resolvePlayerChoice(
                  {
                    id: choice.id,
                    type: choice.kind,
                    sourceInstanceId: choice.sourceInstanceId,
                    stateId,
                  },
                  choice.type,
                )
              }
            >
              {t('pendingChoice.select')}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
