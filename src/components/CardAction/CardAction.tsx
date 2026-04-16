import { Button } from '@components/ui/Button/Button';
import {
  ActivatedIcon,
  DestroyIcon,
  PassifIcon,
  TimeIcon,
  TriggerIcon,
} from '@components/ui/Icon/icon';
import { canAffordResources } from '@engine/application/cardHelpers';
import { TargetScope } from '@engine/domain/enums';
import type { CardAction } from '@engine/domain/types';
import { useGame } from '@hooks/useGame';
import type { ReactNode } from 'react';

type CardActionProps = {
  readonly instanceId: number;
  readonly action: CardAction;
  readonly disabled?: boolean;
  readonly actionLabel: ReactNode;
};

function getActionIcon(
  action: CardAction,
  haveTrigger: boolean,
  hasDestroyItselfCost: boolean,
): ReactNode {
  if (haveTrigger) {
    return action.optional ? (
      <TriggerIcon color="yellow" className="size-3 @3xs:size-6" />
    ) : (
      <TriggerIcon color="red" className="size-3 @3xs:size-6" />
    );
  }
  if (hasDestroyItselfCost) return <DestroyIcon color="red" className="size-3 @3xs:size-6" />;
  if (action.endsTurn) return <TimeIcon className="size-3 @3xs:size-6" />;
  if (action.passive) return <PassifIcon className="size-3 @3xs:size-6" />;
  return <ActivatedIcon color="green" className="size-3 @3xs:size-6" />;
}

export function CardAction({ instanceId, disabled, action, actionLabel }: CardActionProps) {
  const { state, resolveAction } = useGame();
  const affordable = !action.cost || canAffordResources(state.resources, action.cost);
  const hasDestroyItselfCost = action.cost?.destroy?.scope === TargetScope.SELF;
  const haveTrigger = !!action.trigger;
  return (
    <Button
      onClick={() => resolveAction(instanceId, action.id)}
      disabled={!affordable || disabled || haveTrigger}
      variant="text"
      color="base-ink"
      className={`font-body! bg-white/60 px-3! py-2! rounded-md text-xs text-base-ink backdrop-blur-sm @3xs:text-lg ${haveTrigger ? 'cursor-not-allowed' : ''}`}
    >
      {getActionIcon(action, haveTrigger, hasDestroyItselfCost)} {actionLabel}
    </Button>
  );
}
