import type { ChoiceSectionProps } from './shared';
import { CardTrackStep } from '@components/CardTrack/CardTrack';
import { TextStyle } from '@components/ui/Text/Text';
import { ActionEffectType } from '@deck-legacy/engine/domain/enums';
import type { StepDef } from '@deck-legacy/engine/domain/types';
import { Pressable, View } from 'react-native';

export function ChooseStepSection(props: Readonly<ChoiceSectionProps>) {
  const { choice, instances, defs, selectedIds, onToggleId, isMultiSelect, resolvePlayerChoice } =
    props;

  const targetInst = choice.targetInstanceId ? instances[choice.targetInstanceId] : undefined;
  const targetDef = targetInst ? defs[targetInst.cardId] : undefined;
  const targetState = targetDef?.states.find(s => s.id === targetInst?.stateId);
  const track = targetState?.track;
  const stepIds = new Set(
    choice.choices.filter((candidate): candidate is number => typeof candidate === 'number'),
  );
  const steps: StepDef[] = track?.steps.filter(step => stepIds.has(step.id)) ?? [];

  const handleStepPress = (stepId: number) => {
    if (isMultiSelect) {
      onToggleId(stepId);
      return;
    }
    resolvePlayerChoice(
      {
        id: choice.id,
        type: ActionEffectType.TRACK_ADVANCE,
        sourceInstanceId: choice.sourceInstanceId,
        stepIds: [stepId],
      },
      choice.type,
    );
  };

  return (
    <TextStyle className="text-ink-card">
      <View className="flex-row flex-wrap gap-3">
        {steps.map(step => {
          const isSelected = isMultiSelect && selectedIds.includes(step.id);
          return (
            <Pressable
              key={step.id}
              onPress={() => handleStepPress(step.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className={`bg-card active:bg-ink-card/10 min-w-8 items-center gap-1 rounded-md border-2 p-3 ${isSelected ? 'border-primary' : 'border-ink-card'}`}
            >
              {track && targetInst && (
                <CardTrackStep
                  instance={targetInst}
                  track={track}
                  step={step}
                  isValidated={false}
                  wide
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </TextStyle>
  );
}
