import { Button } from '@components/ui/Button/Button';
import {
  ActivatedIcon,
  DestroyIcon,
  PassifIcon,
  TimeIcon,
  TriggerIcon,
} from '@components/ui/Icon/icon';
import {
  canAffordCost,
  canAffordTrackAdvanceCost,
  getEffectiveActionCost,
} from '@engine/application/cardHelpers';
import { canUseOptions } from '@engine/application/gameStateHelper';
import { Options, Phase, TargetScope } from '@engine/domain/enums';
import type { CardAction, CardInstance } from '@engine/domain/types';
import { useGame } from '@hooks/useGame';
import type { ReactNode } from 'react';

type CardActionProps = {
  readonly instance: CardInstance;
  readonly action: CardAction;
  readonly disabled?: boolean;
  readonly actionLabel: ReactNode;
  readonly size?: 'md' | 'lg';
};

function getActionIcon(
  action: CardAction,
  hasDestroyItselfCost: boolean,
  iconClass: string,
): ReactNode {
  if (hasDestroyItselfCost) return <DestroyIcon color="red" className={iconClass} />;
  if (action.endsTurn) return <TimeIcon className={iconClass} />;
  if (action.unlimited) return <PassifIcon className={iconClass} />;
  return <ActivatedIcon className={iconClass} />;
}

function getTriggerIcon(action: CardAction, iconClass: string): ReactNode {
  if (action.unlimited) return <PassifIcon className={iconClass} />;

  return action.optional ? (
    <TriggerIcon color="yellow" className={iconClass} />
  ) : (
    <TriggerIcon color="red" className={iconClass} />
  );
}

export function CardAction({
  instance,
  disabled,
  action,
  actionLabel,
  size = 'md',
}: CardActionProps) {
  const { gameState, defs, stickerDefs, resolveAction } = useGame();
  const isLarge = size === 'lg';
  const iconClass = isLarge ? 'size-6!' : 'size-3 @3xs:size-6';
  const actionClass = isLarge
    ? 'font-body! bg-white/60 p-2! rounded-md text-base! text-base-ink backdrop-blur-sm'
    : 'font-body! bg-white/60 p-1! @3xs:p-2! rounded-md text-xs text-base-ink backdrop-blur-sm @3xs:text-md';
  const effectiveActionCost = getEffectiveActionCost(action.cost, instance);
  const optionDisabled = !canUseOptions(
    gameState,
    action.endsTurn ? Options.END_TURN_ACTION : Options.ACTION,
  );
  const isActionInPlay = (action.unlimited ?? false) || gameState.phase === Phase.PLAYING;
  const affordable =
    canAffordCost(effectiveActionCost, instance.id, gameState, defs, stickerDefs) &&
    canAffordTrackAdvanceCost(action, instance, gameState, defs, stickerDefs);

  const hasDestroyItselfCost =
    effectiveActionCost.destroy?.scope?.includes(TargetScope.SELF) ?? false;
  const haveTrigger = !!action.trigger;
  if (haveTrigger) {
    return (
      <div className={actionClass} data-tour="card-trigger">
        {getTriggerIcon(action, iconClass)} {actionLabel}
      </div>
    );
  }

  let dataTour = 'card-action';

  if (action.endsTurn) {
    dataTour = 'card-action-end-turn';
  } else if (hasDestroyItselfCost) {
    dataTour = 'card-action-destroy-self';
  }
  return (
    <Button
      onClick={() => resolveAction(instance.id, action.id)}
      disabled={
        !affordable || (disabled ?? false) || haveTrigger || optionDisabled || !isActionInPlay
      }
      variant="text"
      color="base-ink"
      className={actionClass}
      data-tour={dataTour}
    >
      {getActionIcon(action, hasDestroyItselfCost, iconClass)} {actionLabel}
    </Button>
  );
}
