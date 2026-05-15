import type { ChoiceSectionProps } from './shared';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import type { Resources } from '@engine/domain/types';

export function ChooseResourceSection(props: Readonly<ChoiceSectionProps>) {
  const { choice, resolvePlayerChoice, resolvePayCost } = props;

  const handleResourceSelect = (index: number) => {
    const resources = choice.choices[index] as Resources;
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

  return (
    <ResourceChoice
      options={choice.choices.filter(
        (candidate): candidate is Resources =>
          typeof candidate !== 'number' && typeof candidate !== 'string',
      )}
      pillClassName="size-7"
      onSelect={handleResourceSelect}
    />
  );
}
