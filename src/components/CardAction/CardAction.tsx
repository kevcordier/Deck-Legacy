import { Button } from '@components/ui/Button/Button';
import {
  ActivatedIcon,
  DestroyIcon,
  PassifIcon,
  TimeIcon,
  TriggerIcon,
} from '@components/ui/Icon/icon';
import { canAffordResources, getFirstAvailableTrackStep } from '@engine/application/cardHelpers';
import { ActionType, TargetScope } from '@engine/domain/enums';
import type { CardAction, CardInstance } from '@engine/domain/types';
import { useGame } from '@hooks/useGame';
import type { ReactNode } from 'react';

type CardActionProps = {
  readonly instance: CardInstance;
  readonly action: CardAction;
  readonly disabled?: boolean;
  readonly actionLabel: ReactNode;
};

function getActionIcon(action: CardAction, hasDestroyItselfCost: boolean): ReactNode {
  if (hasDestroyItselfCost) return <DestroyIcon color="red" className="size-3 @3xs:size-6" />;
  if (action.endsTurn) return <TimeIcon className="size-3 @3xs:size-6" />;
  if (action.passive) return <PassifIcon className="size-3 @3xs:size-6" />;
  return <ActivatedIcon color="green" className="size-3 @3xs:size-6" />;
}

function getTriggerIcon(action: CardAction): ReactNode {
  return action.optional ? (
    <TriggerIcon color="yellow" className="size-3 @3xs:size-6" />
  ) : (
    <TriggerIcon color="red" className="size-3 @3xs:size-6" />
  );
}

export function CardAction({ instance, disabled, action, actionLabel }: CardActionProps) {
  const { state, defs, resolveAction } = useGame();
  const hasTrackAdvance = action.actionEffects.some(e => e.type === ActionType.TRACK_ADVANCE);
  const firstTrackStep = hasTrackAdvance
    ? getFirstAvailableTrackStep(action.actionEffects, instance.id, state, defs)
    : undefined;
  const affordable = hasTrackAdvance
    ? canAffordResources(state.resources, firstTrackStep?.cost)
    : !action.cost || canAffordResources(state.resources, action.cost);
  const hasDestroyItselfCost = action.cost?.destroy?.scope === TargetScope.SELF;
  const haveTrigger = !!action.trigger;
  if (haveTrigger) {
    return (
      <div
        className={`font-body! bg-white/60 px-3! py-2! rounded-md text-xs text-base-ink backdrop-blur-sm @3xs:text-lg`}
      >
        {getTriggerIcon(action)} {actionLabel}
      </div>
    );
  }
  return (
    <Button
      onClick={() => resolveAction(instance.id, action.id)}
      disabled={!affordable || disabled || haveTrigger}
      variant="text"
      color="base-ink"
      className={`font-body! bg-white/60 px-3! py-2! rounded-md text-xs text-base-ink backdrop-blur-sm @3xs:text-lg`}
    >
      {getActionIcon(action, hasDestroyItselfCost)} {actionLabel}
    </Button>
  );
}
