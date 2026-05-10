import type { ChoiceSectionProps } from './shared';
import { Button } from '@components/ui/Button/Button';
import type { ActionEffect } from '@engine/domain/types';
import { tCardActionLabel } from '@helpers/cardI18n';

export function ChooseActionEffectSection(props: Readonly<ChoiceSectionProps>) {
  const { choice, instances, defs, t, resolvePlayerChoice } = props;
  const sourceInstance = instances[choice.sourceInstanceId];
  const sourceDef = sourceInstance ? defs[sourceInstance.cardId] : undefined;
  const sourceState = sourceDef?.states.find(s => s.id === sourceInstance?.stateId);

  return (
    <div className="flex flex-col gap-4">
      {choice.choices.map((actionEffect, index) => {
        // Find the action that contains this effect
        const effectId = (actionEffect as ActionEffect).id;
        const action = sourceState?.actions?.find(a =>
          a.actionEffects.some(ae => ae.id === effectId),
        );

        return (
          <div
            key={`${(actionEffect as ActionEffect).id}-${index.toString()}`}
            className="bg-card flex items-center justify-between gap-5 rounded border p-4"
          >
            <div className="flex-1">
              <div className="font-display text-base-primary mb-1 text-sm font-semibold">
                {action && tCardActionLabel(t, action.id, sourceInstance?.cumulated)}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button
                size="sm"
                color="base-primary"
                onClick={() =>
                  resolvePlayerChoice(
                    {
                      id: choice.id,
                      type: choice.kind,
                      sourceInstanceId: choice.sourceInstanceId,
                      newActionEffects: [actionEffect as ActionEffect],
                    },
                    choice.type,
                  )
                }
              >
                {t('triggerPile.resolve')}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
