import type { ChoiceSectionProps } from './ChoiceSectionProps';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { Text } from '@components/ui/Text/Text';
import type { Resources } from '@deck-legacy/engine/domain/types';
import { View } from 'react-native';

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
    <View className="gap-3">
      {selectedChoices.length > 0 && (
        <View className="gap-1">
          <Text className="text-ink/80 text-sm">{props.t('pendingChoice.alreadySelected')}</Text>
          <ResourceChoice
            options={selectedChoices}
            pillClassName="size-7"
            disabled
            onSelect={() => undefined}
          />
        </View>
      )}
      <ResourceChoice
        options={resourceChoices}
        pillClassName="size-7"
        onSelect={handleResourceSelect}
      />
    </View>
  );
}
