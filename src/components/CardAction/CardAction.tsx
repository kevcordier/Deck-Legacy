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
import { Options, TargetScope } from '@engine/domain/enums';
import type { CardAction, CardInstance } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';
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
  if (action.unlimited) return <PassifIcon className="size-3 @3xs:size-6" />;
  return <ActivatedIcon className="size-3 @3xs:size-6" />;
}

function getTriggerIcon(action: CardAction): ReactNode {
  if (action.unlimited) return <PassifIcon className="size-3 @3xs:size-6" />;

  return action.optional ? (
    <TriggerIcon color="yellow" className="size-3 @3xs:size-6" />
  ) : (
    <TriggerIcon color="red" className="size-3 @3xs:size-6" />
  );
}

export function CardAction({ instance, disabled, action, actionLabel }: CardActionProps) {
  const { gameState, defs, stickerDefs, resolveAction } = useGame();
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
      <div
        className={`font-body! bg-white/60 p-1! @3xs:px-3! @3xs:py-2! rounded-md text-xs text-base-ink backdrop-blur-sm @3xs:text-md`}
        data-tour="card-trigger"
      >
        {getTriggerIcon(action)} {actionLabel}
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
      className={`font-body! bg-white/60 p-1! @3xs:px-3! @3xs:py-2! rounded-md text-xs text-base-ink backdrop-blur-sm @3xs:text-md`}
      data-tour={dataTour}
    >
      {getActionIcon(action, hasDestroyItselfCost)} {actionLabel}
    </Button>
  );
}
