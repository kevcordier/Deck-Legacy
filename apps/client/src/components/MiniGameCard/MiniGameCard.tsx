import { CardIllustration } from '@components/CardTilt/CardIllustration';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Glory } from '@components/ui/Glory/Glory';
import {
  ActivatedIcon,
  DestroyIcon,
  PassifIcon,
  TriggerIcon,
  UpgradeIcon,
} from '@components/ui/Icon/icon';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { Tag } from '@components/ui/Tag/Tag';
import { Text } from '@components/ui/Text/Text';
import {
  canAffordCost,
  canAffordTrackAdvanceCost,
  cardIsBlocked,
  getActiveState,
  getEffectiveActionCost,
  getEffectiveGlory,
  getEffectiveUpgradeCost,
  getProductionChoicesForAction,
  tagTextClass,
} from '@deck-legacy/engine/application/cardHelpers';
import { canUseOptions } from '@deck-legacy/engine/application/gameStateHelper';
import { Options, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardInstance, StepDef } from '@deck-legacy/engine/domain/types';
import { tCardName } from '@helpers/cardI18n';
import { getIllustrationSource } from '@helpers/illustrations';
import { useGame } from '@hooks/useGame';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

type MiniGameCardProps = {
  readonly instance: CardInstance;
  readonly isOnBoard?: boolean;
  readonly className?: string;
  readonly tourTarget?: boolean;
  readonly onPress?: () => void;
};

const CARD_COLOR = '#f0e4be';

function Badge({
  label,
  highlighted = false,
  children,
}: {
  readonly label: string;
  readonly highlighted?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <View
      accessibilityLabel={label}
      className={`bg-card rounded-full border p-1.5 shadow-sm ${highlighted ? 'border-base-primary' : 'border-border'}`}
    >
      {children}
    </View>
  );
}

type ActionBadgesProps = {
  readonly hasPassive: boolean;
  readonly hasTrigger: boolean;
  readonly hasDestroyAction: boolean;
  readonly hasAction: boolean;
  readonly hasUpgrade: boolean;
  readonly hasAvailableDestroyAction: boolean;
  readonly hasAvailableAction: boolean;
  readonly hasAvailableUpgrade: boolean;
};

function ActionBadges({
  hasPassive,
  hasTrigger,
  hasDestroyAction,
  hasAction,
  hasUpgrade,
  hasAvailableDestroyAction,
  hasAvailableAction,
  hasAvailableUpgrade,
}: ActionBadgesProps) {
  const { t } = useTranslation();
  if (!hasPassive && !hasTrigger && !hasDestroyAction && !hasAction && !hasUpgrade) return null;

  // Row-reverse keeps the original visual order (passive … upgrade) anchored to the right.
  return (
    <View className="absolute bottom-1 right-1 flex-row-reverse flex-wrap-reverse items-end justify-start gap-1">
      {hasUpgrade && (
        <Badge label={t('card.upgradeAvailable')} highlighted={hasAvailableUpgrade}>
          <UpgradeIcon
            className={`size-5 ${hasAvailableUpgrade ? 'text-base-ink' : 'text-gray'}`}
          />
        </Badge>
      )}
      {hasAction && (
        <Badge label={t('card.actionAvailable')} highlighted={hasAvailableAction}>
          <ActivatedIcon className="size-5" color={hasAvailableAction ? 'green' : 'gray'} />
        </Badge>
      )}
      {hasDestroyAction && (
        <Badge label={t('card.destroyActionAvailable')} highlighted={hasAvailableDestroyAction}>
          <DestroyIcon className="size-5" color={hasAvailableDestroyAction ? 'red' : 'gray'} />
        </Badge>
      )}
      {hasTrigger && (
        <Badge label={t('card.hasTrigger')}>
          <TriggerIcon className="text-base-ink size-5" />
        </Badge>
      )}
      {hasPassive && (
        <Badge label={t('card.hasPassive')}>
          <PassifIcon className="text-base-ink size-5" />
        </Badge>
      )}
    </View>
  );
}

function MiniTrack({
  steps,
  validatedSteps,
}: {
  readonly steps: StepDef[];
  readonly validatedSteps: number[];
}) {
  return (
    <View className="absolute inset-x-0 bottom-1 flex-row flex-wrap items-center justify-center gap-0.5 px-1">
      {steps.map(step => {
        const isValidated = validatedSteps.includes(step.id);
        return (
          <View
            key={step.id}
            className={`size-4 shrink-0 items-center justify-center rounded-sm border ${
              isValidated ? 'border-success bg-success/20' : 'border-base-ink/70 bg-base-ink/10'
            }`}
          >
            {isValidated && <Text className="text-success text-xs leading-none">✓</Text>}
          </View>
        );
      })}
    </View>
  );
}

export function MiniGameCard({
  instance,
  isOnBoard = false,
  className = '',
  tourTarget = false,
  onPress,
}: MiniGameCardProps) {
  const { t } = useTranslation();
  const { gameState, defs, stickerDefs, getCardName, resolveProduction } = useGame();
  const isBlocked = isOnBoard && cardIsBlocked(instance.id, gameState);
  const cs = getActiveState(instance, defs);
  const isEnemy = cs.negative === true;
  const titleColorClass = tagTextClass(cs.tags?.[0] ?? '', isEnemy);
  const rawCardName = tCardName(t, cs.name || '');
  const canChooseName = cs.chooseName === true && rawCardName.includes('_____');
  const displayName = canChooseName
    ? rawCardName.replace('_____', getCardName(instance.id) ?? '')
    : rawCardName;
  const illustration = getIllustrationSource(cs.illustration);

  const productions =
    cs.productions?.flatMap(base =>
      getProductionChoicesForAction(base, gameState, defs, instance, stickerDefs),
    ) ?? getProductionChoicesForAction({}, gameState, defs, instance, stickerDefs);
  const hasProductions = productions?.some(prod => Object.keys(prod).length > 0) ?? false;
  const canActivate = isOnBoard && !isBlocked;

  const glory = getEffectiveGlory(cs, gameState, defs, instance, stickerDefs);
  const hasGlory = cs.glory !== undefined && (cs.glory.amount !== 0 || !!cs.glory.valuePerElement);

  const upgrades = cs.upgrade ?? [];
  const hasUpgrade = upgrades.length > 0;
  const hasAvailableUpgrade =
    !isBlocked &&
    canUseOptions(gameState, Options.UPGRADE) &&
    upgrades.some(upg => {
      const cost = getEffectiveUpgradeCost(upg.cost, gameState, defs, stickerDefs, instance.id);
      return canAffordCost(cost, instance.id, gameState, defs, stickerDefs);
    });

  const actions = (cs.actions ?? []).filter(
    action =>
      action.limitedTime === undefined ||
      instance.usedActionIds.filter(usedId => usedId === action.id).length < action.limitedTime,
  );
  const isActionAffordable = (action: CardAction) => {
    const optionDisabled = !canUseOptions(
      gameState,
      action.endsTurn ? Options.END_TURN_ACTION : Options.ACTION,
    );
    if (optionDisabled) return false;
    const cost = getEffectiveActionCost(action.cost, instance);
    return (
      canAffordCost(cost, instance.id, gameState, defs, stickerDefs) &&
      canAffordTrackAdvanceCost(action, instance, gameState, defs, stickerDefs)
    );
  };
  const triggerActions = actions.filter(action => action.trigger);
  const destroyActions = actions.filter(
    action =>
      !action.trigger &&
      (getEffectiveActionCost(action.cost, instance).destroy?.scope?.includes(TargetScope.SELF) ??
        false),
  );
  const regularActions = actions.filter(
    action => !action.trigger && !destroyActions.includes(action),
  );

  const hasPassive = (cs.passives?.length ?? 0) > 0;
  const hasTrigger = triggerActions.length > 0;
  const hasDestroyAction = destroyActions.length > 0;
  const hasAction = regularActions.length > 0;

  const canActivateAction = isOnBoard && !isBlocked;
  const hasAvailableDestroyAction = canActivateAction && destroyActions.some(isActionAffordable);
  const hasAvailableAction = canActivateAction && regularActions.some(isActionAffordable);

  return (
    <TutorialTarget id={tourTarget ? 'card-root' : undefined} className={`w-full ${className}`}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={{ aspectRatio: 3 / 5 }}
        className="border-border bg-card relative w-full min-w-16 shrink-0 overflow-hidden rounded-md border shadow-md"
      >
        {illustration && (
          <>
            <CardIllustration source={illustration} />
            <LinearGradient
              colors={['transparent', 'rgba(240, 228, 190, 0.7)', CARD_COLOR]}
              className="absolute inset-x-0 bottom-0 h-4/5"
            />
          </>
        )}

        <View className="absolute inset-0 items-start gap-1 p-1 pt-2">
          <Tag label={displayName} className="bg-black/60" textClassName={titleColorClass} />

          {hasProductions && productions && (
            <TutorialTarget id={tourTarget ? 'card-production' : undefined}>
              <ResourceChoice
                onSelect={choosenOption => resolveProduction(instance.id, choosenOption)}
                options={productions}
                disabled={!canActivate}
                pillClassName="size-5"
              />
            </TutorialTarget>
          )}
          {hasGlory && <Glory glory={glory} className="size-8" textClassName="text-xs" />}

          <ActionBadges
            hasPassive={hasPassive}
            hasTrigger={hasTrigger}
            hasDestroyAction={hasDestroyAction}
            hasAction={hasAction}
            hasUpgrade={hasUpgrade}
            hasAvailableDestroyAction={hasAvailableDestroyAction}
            hasAvailableAction={hasAvailableAction}
            hasAvailableUpgrade={hasAvailableUpgrade}
          />
          {!isBlocked && cs.track && (
            <MiniTrack steps={cs.track.steps} validatedSteps={instance.trackProgress} />
          )}
        </View>
      </Pressable>
    </TutorialTarget>
  );
}
