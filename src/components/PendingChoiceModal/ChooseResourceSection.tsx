import type { ChoiceSectionProps } from './shared';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import type { Resources } from '@engine/domain/types';

export function ChooseResourceSection(props: Readonly<ChoiceSectionProps>) {
  const { choice, resolvePlayerChoice, resolvePayCost } = props;

  const resourceChoices = choice.choices.filter(
    (candidate): candidate is Resources =>
      typeof candidate !== 'number' && typeof candidate !== 'string',
  );

  const handleResourceSelect = (index: number) => {
    const resources = resourceChoices[index];
    if (!resources) return;

    if (choice.kind === 'COST') {
      resolvePayCost({ resources, discardedCardIds: [], destroyedCardIds: [] });
      return;
    }
    resolvePlayerChoice(
      {
        id: choice.id,
        type: choice.kind,
        sourceInstanceId: choice.sourceInstanceId,
        resources,
      },
      choice.type,
    );
  };

  const selectedChoices = (choice.selectedChoices ?? []).filter(Boolean);

  return (
    <div className="flex flex-col gap-3">
      {selectedChoices.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink/80">{props.t('pendingChoice.alreadySelected')}</span>
          <ResourceChoice
            options={selectedChoices}
            pillClassName="size-7"
            disabled
            onSelect={() => undefined}
          />
        </div>
      )}
      <ResourceChoice
        options={resourceChoices}
        pillClassName="size-7"
        onSelect={handleResourceSelect}
      />
    </div>
  );
}
