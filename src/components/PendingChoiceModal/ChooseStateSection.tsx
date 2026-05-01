import { type ChoiceSectionProps, makePreviewInstance } from './shared';
import { GameCard } from '@components/GameCard/GameCard';

export function ChooseStateSection(props: Readonly<ChoiceSectionProps>) {
  const { choice, instances, defs, resolvePlayerChoice } = props;
  const sourceInst = instances[choice.sourceInstanceId];
  const cardDef = sourceInst ? defs[sourceInst.cardId] : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {choice.choices.map(stateId => {
        if (typeof stateId !== 'number') return null;
        const state = cardDef?.states.find(candidate => candidate.id === stateId);
        if (!cardDef || !state) return null;
        return (
          <div key={stateId} className="relative transition-transform hover:scale-[1.02]">
            <button
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
              className="absolute inset-0 z-12 cursor-pointer!"
            ></button>
            <GameCard
              instance={makePreviewInstance(choice.sourceInstanceId, cardDef, state)}
              hideStatePreview
            />
          </div>
        );
      })}
    </div>
  );
}
