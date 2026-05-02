import { type ChoiceSectionProps, makePreviewInstance } from './shared';
import { GameCard } from '@components/GameCard/GameCard';

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

  const handleCardClick = (instanceId: number) => {
    if (isMultiSelect) {
      onToggleId(instanceId);
      return;
    }
    if (choice.kind === 'COST') {
      resolvePayCost({ resources: {}, discardedCardIds: [instanceId], destroyedCardIds: [] });
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {choice.choices.map((id, index) => {
        if (typeof id !== 'number') return null;
        const inst = instances[id];
        const def = inst ? defs[inst.cardId] : undefined;
        if (!def || !inst) return null;
        const state = def.states.find(s => s.id === inst.stateId) ?? def.states[0];
        const isSelected = isMultiSelect && selectedIds.includes(id);
        return (
          <div
            className={`relative transition-transform hover:scale-[1.02]${isSelected ? ' ring-primary rounded-xl ring-2' : ''}`}
            key={`${id}-${index.toString()}`}
          >
            <button
              onClick={() => handleCardClick(id)}
              className="absolute inset-0 z-12 cursor-pointer!"
            ></button>
            <GameCard instance={makePreviewInstance(id, def, state)} hideStatePreview />
          </div>
        );
      })}
    </div>
  );
}
