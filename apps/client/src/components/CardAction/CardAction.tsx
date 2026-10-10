import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { HoverPressable } from '@components/ui/HoverPressable/HoverPressable';
import {
  ActivatedIcon,
  DestroyIcon,
  PassifIcon,
  TimeIcon,
  TriggerIcon,
} from '@components/ui/Icon/icon';
import { Text } from '@components/ui/Text/Text';
import {
  canAffordCost,
  canAffordTrackAdvanceCost,
  getEffectiveActionCost,
} from '@deck-legacy/engine/application/cardHelpers';
import { canUseOptions } from '@deck-legacy/engine/application/gameStateHelper';
import { Options, Phase, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardInstance } from '@deck-legacy/engine/domain/types';
import { useGame } from '@hooks/useGame';
import type { ReactNode } from 'react';
import { View } from 'react-native';

type CardActionProps = {
  readonly instance: CardInstance;
  readonly action: CardAction;
  readonly disabled?: boolean;
  readonly actionLabel: ReactNode;
  readonly size?: 'md' | 'lg';
  /** Roomier layout for wide medium cards. */
  readonly wide?: boolean;
  /** Registers the action as the `card-action` tutorial target. */
  readonly tourTarget?: boolean;
  readonly onTriggered?: () => void;
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
  wide = false,
  tourTarget = false,
  onTriggered,
}: CardActionProps) {
  const { gameState, defs, stickerDefs, resolveAction } = useGame();
  const isLarge = size === 'lg';
  const iconClass = isLarge || wide ? 'size-6' : 'size-3';
  const boxClass = `bg-white/60 rounded-md ${isLarge || wide ? 'p-2' : 'p-1'}`;
  const textClass = isLarge ? 'text-base' : 'text-xs';
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

  if (action.trigger) {
    return (
      <View className={boxClass}>
        <Text className={textClass}>
          {getTriggerIcon(action, iconClass)} {actionLabel}
        </Text>
      </View>
    );
  }

  const isDisabled = !affordable || (disabled ?? false) || optionDisabled || !isActionInPlay;

  return (
    <TutorialTarget id={tourTarget ? 'card-action' : undefined}>
      <HoverPressable
        onPress={() => {
          resolveAction(instance.id, action.id);
          onTriggered?.();
        }}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        className={`${boxClass} active:bg-base-ink/20 ${isDisabled ? 'opacity-50' : ''}`}
      >
        <Text className={textClass}>
          {getActionIcon(action, hasDestroyItselfCost, iconClass)} {actionLabel}
        </Text>
      </HoverPressable>
    </TutorialTarget>
  );
}
