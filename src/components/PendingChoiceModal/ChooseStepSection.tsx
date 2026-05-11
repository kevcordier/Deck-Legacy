import type { ChoiceSectionProps } from './shared';
import { CardTrackContent } from '@components/CardTrack/CardTrack';
import { ActionEffectType } from '@engine/domain/enums';
import type { StepDef } from '@engine/domain/types';

export function ChooseStepSection(props: Readonly<ChoiceSectionProps>) {
  const {
    choice,
    instances,
    defs,
    selectedIds,
    onToggleId,
    isMultiSelect,
    resolvePlayerChoice,
    t,
  } = props;

  const targetInst = choice.targetInstanceId ? instances[choice.targetInstanceId] : undefined;
  const targetDef = targetInst ? defs[targetInst.cardId] : undefined;
  const targetState = targetDef?.states.find(s => s.id === targetInst?.stateId);
  const track = targetState?.track;
  const stepIds = new Set(
    choice.choices.filter((candidate): candidate is number => typeof candidate === 'number'),
  );
  const steps: StepDef[] = track?.steps.filter(step => stepIds.has(step.id)) ?? [];

  const handleStepClick = (stepId: number) => {
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
    <div className="flex flex-wrap gap-3">
      {steps.map(step => {
        const isSelected = isMultiSelect && selectedIds.includes(step.id);
        return (
          <button
            key={step.id}
            onClick={() => handleStepClick(step.id)}
            className={`flex min-w-16 flex-col items-center gap-1 rounded-md border-2 border-base-ink bg-card p-3 hover:bg-base-ink/10 ${isSelected ? ' inset-ring-primary rounded-xl inset-ring-2' : ''}`}
          >
            {track && targetInst && (
              <CardTrackContent
                t={t}
                instance={targetInst}
                track={track}
                step={step}
                isValidated={false}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
