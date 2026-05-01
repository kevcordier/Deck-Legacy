import { Button } from '@components/ui/Button/Button';
import {
  ActivatedIcon,
  DestroyIcon,
  PassifIcon,
  TimeIcon,
  TriggerIcon,
} from '@components/ui/Icon/icon';
import {
  canAffordCardCost,
  canAffordResources,
  getActiveState,
  getFirstAvailableTrackStep,
} from '@engine/application/cardHelpers';
import { canUseOptions } from '@engine/application/gameStateHelper';
import { ActionEffectType, Options, TargetScope } from '@engine/domain/enums';
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
  return <ActivatedIcon color="green" className="size-3 @3xs:size-6" />;
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
  const cs = getActiveState(instance, defs);
  const hasTrackAdvance =
    action.actionEffects.some(e => e.type === ActionEffectType.TRACK_ADVANCE) && cs?.track;
  const firstTrackStep = hasTrackAdvance
    ? getFirstAvailableTrackStep(action.actionEffects, instance.id, gameState, defs, stickerDefs)
    : undefined;
  const cardCostAffordable = canAffordCardCost(
    action.cost,
    instance.id,
    gameState,
    defs,
    stickerDefs,
  );
  const optionDisabled = !canUseOptions(
    gameState,
    action.endsTurn ? Options.END_TURN_ACTION : Options.ACTION,
  );
  const isActionInPlay = action.unlimited || gameState.phase === Phase.PLAYING;
  const affordable = hasTrackAdvance
    ? firstTrackStep &&
      canAffordResources(gameState.resources, firstTrackStep?.cost) &&
      canAffordResources(gameState.resources, action.cost) &&
      cardCostAffordable
    : (!action.cost || canAffordResources(gameState.resources, action.cost)) && cardCostAffordable;
  const hasDestroyItselfCost = action.cost?.destroy?.scope?.includes(TargetScope.SELF) ?? false;
  const haveTrigger = !!action.trigger;
  if (haveTrigger) {
    return (
      <div
        className={`font-body! bg-white/60 px-3! py-2! rounded-md text-xs text-base-ink backdrop-blur-sm @3xs:text-md`}
      >
        {getTriggerIcon(action)} {actionLabel}
      </div>
    );
  }
  return (
    <Button
      onClick={() => resolveAction(instance.id, action.id)}
      disabled={!affordable || disabled || haveTrigger || optionDisabled || !isActionInPlay}
      variant="text"
      color="base-ink"
      className={`font-body! bg-white/60 px-3! py-2! rounded-md text-xs text-base-ink backdrop-blur-sm @3xs:text-md`}
    >
      {getActionIcon(action, hasDestroyItselfCost)} {actionLabel}
    </Button>
  );
}
