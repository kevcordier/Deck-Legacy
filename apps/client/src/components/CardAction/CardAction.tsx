import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { HoverPressable } from '@components/ui/HoverPressable/HoverPressable';
import {
  ActivatedIcon,
  DestroyIcon,
  PassifIcon,
  TimeIcon,
  TriggerIcon,
} from '@components/ui/Icon/icon';
import { TextInput } from '@components/ui/Input/TextInput';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import {
  canAffordCost,
  canAffordTrackAdvanceCost,
  evaluateCondition,
  getEffectiveActionCost,
} from '@deck-legacy/engine/application/cardHelpers';
import { canUseOptions } from '@deck-legacy/engine/application/gameStateHelper';
import { hasAnyAmountCost } from '@deck-legacy/engine/application/resources';
import { Options, Phase, type ResourceType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardInstance } from '@deck-legacy/engine/domain/types';
import { useGame } from '@hooks/useGame';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

/** The most the player can pay for an `'any'` resource cost (e.g. goods deposited on Export). */
function getMaxAnyAmount(action: CardAction, stock: Partial<Record<ResourceType, number>>) {
  const resources = action.cost?.resources?.[0] ?? {};
  const resource = Object.keys(resources).find(key => resources[key as ResourceType] === 'any') as
    ResourceType | undefined;
  return resource ? (stock[resource] ?? 0) : 0;
}

function DepositModal({
  max,
  onConfirm,
  onClose,
}: {
  readonly max: number;
  readonly onConfirm: (count: number) => void;
  readonly onClose: () => void;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState(String(max));
  const count = Math.min(max, Math.max(0, Number.parseInt(text, 10) || 0));
  return (
    <Modal
      title={t('card.deposit.title')}
      onClose={onClose}
      footer={
        <Button variant="contained" onPress={() => onConfirm(count)}>
          {t('card.deposit.confirm', { count })}
        </Button>
      }
    >
      <View className="flex-row items-center justify-center gap-2">
        <Button
          variant="outlined"
          className="size-11"
          disabled={count <= 0}
          onPress={() => setText(String(count - 1))}
          accessibilityLabel={t('card.deposit.less')}
        >
          ‹
        </Button>
        <View className="w-20">
          <TextInput
            value={text}
            onChangeText={value => setText(value.replaceAll(/\D/g, ''))}
            onBlur={() => setText(String(count))}
            keyboardType="number-pad"
            inputMode="numeric"
            selectTextOnFocus
            autoFocus
            accessibilityLabel={t('card.deposit.title')}
            className="min-h-11 text-center text-2xl"
          />
        </View>
        <Text className="font-body-bold text-2xl">/ {max}</Text>
        <Button
          variant="outlined"
          className="size-11"
          disabled={count >= max}
          onPress={() => setText(String(count + 1))}
          accessibilityLabel={t('card.deposit.more')}
        >
          ›
        </Button>
      </View>
    </Modal>
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
  const [depositOpen, setDepositOpen] = useState(false);
  const isLarge = size === 'lg';
  const iconClass = isLarge || wide ? 'size-6' : 'size-3';
  const boxClass = `bg-white/60 rounded-md ${isLarge || wide ? 'p-2' : 'p-1'}`;
  const textClass = isLarge ? 'text-base text-center' : 'text-xs text-center';
  const effectiveActionCost = getEffectiveActionCost(action.cost, instance);
  const optionDisabled = !canUseOptions(
    gameState,
    action.endsTurn ? Options.END_TURN_ACTION : Options.ACTION,
  );
  const isActionInPlay = (action.unlimited ?? false) || gameState.phase === Phase.PLAYING;
  const affordable =
    (!action.condition ||
      evaluateCondition(action.condition, gameState, instance.id, defs, stickerDefs)) &&
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
  const isAnyAmount = hasAnyAmountCost(action.cost);

  return (
    <TutorialTarget id={tourTarget ? 'card-action' : undefined}>
      <HoverPressable
        onPress={() => {
          if (!isAnyAmount) {
            resolveAction(instance.id, action.id);
            onTriggered?.();
          } else setDepositOpen(true);
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
      {depositOpen && (
        <DepositModal
          max={getMaxAnyAmount(action, gameState.resources)}
          onClose={() => setDepositOpen(false)}
          onConfirm={count => {
            setDepositOpen(false);
            if (count === 0) return;
            resolveAction(instance.id, action.id, undefined, count);
            onTriggered?.();
          }}
        />
      )}
    </TutorialTarget>
  );
}
