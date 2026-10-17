import { CardIllustration } from '@components/CardTilt/CardIllustration';
import { Glory } from '@components/ui/Glory/Glory';
import {
  ActivatedIcon,
  DestroyIcon,
  PassifIcon,
  TimeIcon,
  TriggerIcon,
  UnlimitedIcon,
  UpgradeIcon,
} from '@components/ui/Icon/icon';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { StickerDisplay } from '@components/ui/StickerDisplay/StickerDisplay';
import { Tag } from '@components/ui/Tag/Tag';
import { Text } from '@components/ui/Text/Text';
import {
  canAffordCost,
  canAffordTrackAdvanceCost,
  cardIsBlocked,
  evaluateCondition,
  getActiveState,
  getEffectiveActionCost,
  getEffectiveGlory,
  getEffectiveUpgradeCost,
  getProductionChoicesForAction,
  tagBorderClass,
} from '@deck-legacy/engine/application/cardHelpers';
import { canUseOptions } from '@deck-legacy/engine/application/gameStateHelper';
import { Options, PassiveType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardInstance, StepDef } from '@deck-legacy/engine/domain/types';
import { tCardName, tCardPassiveLabel } from '@helpers/cardI18n';
import { getIllustrationSource } from '@helpers/illustrations';
import { getResMeta } from '@helpers/renderHelpers';
import { useGame } from '@hooks/useGame';
import { LinearGradient } from 'expo-linear-gradient';
import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

type MiniGameCardProps = {
  readonly instance: CardInstance;
  readonly isOnBoard?: boolean;
  readonly className?: string;
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
      className={`bg-card rounded-full border-2 p-1.5 shadow-sm ${highlighted ? 'border-card' : 'border-border'}`}
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
  readonly actionIcon: 'time' | 'unlimited' | 'activated';
  readonly hasAvailableDestroyAction: boolean;
  readonly hasAvailableAction: boolean;
};

function ActionBadges({
  hasPassive,
  hasTrigger,
  hasDestroyAction,
  hasAction,
  actionIcon,
  hasAvailableDestroyAction,
  hasAvailableAction,
}: ActionBadgesProps) {
  const { t } = useTranslation();
  if (!hasPassive && !hasTrigger && !hasDestroyAction && !hasAction) return null;

  // Row-reverse keeps the original visual order (passive … upgrade) anchored to the right.
  return (
    <View className="flex-row-reverse flex-wrap-reverse items-end justify-start gap-1 self-end">
      {hasAction && (
        <Badge label={t('card.actionAvailable')} highlighted={hasAvailableAction}>
          {actionIcon === 'time' && (
            <TimeIcon className="size-5" color={hasAvailableAction ? 'green' : 'gray'} />
          )}
          {actionIcon === 'unlimited' && (
            <UnlimitedIcon className="size-5" color={hasAvailableAction ? 'green' : 'gray'} />
          )}
          {actionIcon === 'activated' && (
            <ActivatedIcon className="size-5" color={hasAvailableAction ? 'green' : 'gray'} />
          )}
        </Badge>
      )}
      {hasDestroyAction && (
        <Badge label={t('card.destroyActionAvailable')} highlighted={hasAvailableDestroyAction}>
          <DestroyIcon className="size-5" color={hasAvailableDestroyAction ? 'red' : 'gray'} />
        </Badge>
      )}
      {hasTrigger && (
        <Badge label={t('card.hasTrigger')}>
          <TriggerIcon className="text-ink-card size-5" />
        </Badge>
      )}
      {hasPassive && (
        <Badge label={t('card.hasPassive')}>
          <PassifIcon className="text-ink-card size-5" />
        </Badge>
      )}
    </View>
  );
}

function MiniUpgrades({ upgrades }: { readonly upgrades: MiniUpgrade[] }) {
  const { t } = useTranslation();
  if (upgrades.length === 0) return null;
  return (
    <View className="flex-row flex-wrap items-center justify-end gap-1">
      {upgrades.map(({ upgradeTo, resources, available }) => (
        <View
          key={upgradeTo}
          accessibilityLabel={t('card.upgradeAvailable')}
          className={`bg-card flex-row items-center gap-0.5 rounded-full border-2 px-1.5 py-1 shadow-sm ${available ? 'border-card' : 'border-border'}`}
        >
          <UpgradeIcon className={`size-5 ${available ? 'text-ink-card' : 'text-gray'}`} />
          {Object.entries(resources).map(([k, v]) => {
            const meta = getResMeta(k);
            return (
              <Fragment key={k}>
                <Text className="text-ink-card text-sm leading-none">{v}</Text>
                {meta.icon && <meta.icon className="size-5" color={meta.color} alt={k} />}
              </Fragment>
            );
          })}
        </View>
      ))}
    </View>
  );
}

type MiniUpgrade = {
  readonly upgradeTo: number;
  readonly resources: Record<string, number>;
  readonly available: boolean;
};

function MiniTrack({
  steps,
  validatedSteps,
}: {
  readonly steps: StepDef[];
  readonly validatedSteps: number[];
}) {
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-1">
      {steps.map(step => {
        const isValidated = validatedSteps.includes(step.id);
        return (
          <View
            key={step.id}
            className={`size-6 shrink-0 items-center justify-center rounded border ${
              isValidated ? 'border-success bg-success/20' : 'border-ink-card/70 bg-ink-card/10'
            }`}
          >
            {isValidated && <Text className="text-success text-base leading-none">✓</Text>}
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
  onPress,
}: MiniGameCardProps) {
  const { t } = useTranslation();
  const { gameState, defs, stickerDefs, getCardName, resolveProduction } = useGame();
  const isBlocked = isOnBoard && cardIsBlocked(instance.id, gameState);
  const cs = getActiveState(instance, defs);
  const isEnemy = cs.negative === true;
  const titleBorderClass = tagBorderClass(cs.tags?.[0] ?? '', isEnemy);
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

  const canUpgrade = !isBlocked && canUseOptions(gameState, Options.UPGRADE);
  const upgrades: MiniUpgrade[] = (cs.upgrade ?? []).map(upg => {
    const cost = getEffectiveUpgradeCost(upg.cost, gameState, defs, stickerDefs, instance.id);
    return {
      upgradeTo: upg.upgradeTo,
      resources: (cost.resources?.[0] ?? {}) as Record<string, number>,
      available: canUpgrade && canAffordCost(cost, instance.id, gameState, defs, stickerDefs),
    };
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
      (!action.condition ||
        evaluateCondition(action.condition, gameState, instance.id, defs, stickerDefs)) &&
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

  // "Stays in play" is written on the card: the passive badge is for the other passives.
  const stayInPlay = cs.passives?.find(p => p.type === PassiveType.STAY_IN_PLAY);
  const hasPassive = cs.passives?.some(p => p.type !== PassiveType.STAY_IN_PLAY) ?? false;
  const stickers = (instance.stickers[instance.stateId] ?? [])
    .map(id => stickerDefs[id])
    .filter(Boolean);
  const hasTrigger = triggerActions.length > 0;
  const hasDestroyAction = destroyActions.length > 0;
  const hasAction = regularActions.length > 0;
  // Same precedence as CardAction's icon: ends turn (hourglass), then unlimited, then activated.
  let actionIcon: ActionBadgesProps['actionIcon'] = 'activated';
  if (hasAction && regularActions.every(action => action.endsTurn)) actionIcon = 'time';
  else if (hasAction && regularActions.every(action => action.unlimited)) actionIcon = 'unlimited';

  const canActivateAction = isOnBoard && !isBlocked;
  const hasAvailableDestroyAction = canActivateAction && destroyActions.some(isActionAffordable);
  const hasAvailableAction = canActivateAction && regularActions.some(isActionAffordable);

  return (
    <View className={`w-full ${className}`}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={{ aspectRatio: 3 / 5 }}
        className="bg-card relative w-full min-w-16 shrink-0 overflow-hidden rounded-md border border-black/60 shadow-md"
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
          <View className="w-full flex-row justify-center">
            <Tag
              label={displayName}
              // Shrinks to the card width so long names wrap instead of overflowing.
              className={`max-w-full shrink border bg-black/60 ${titleBorderClass}`}
              textClassName="text-center text-sm text-white"
            />
          </View>

          {hasProductions && productions && (
            <ResourceChoice
              onSelect={choosenOption => resolveProduction(instance.id, choosenOption)}
              options={productions}
              disabled={!canActivate}
              pillClassName="size-5"
            />
          )}
          {hasGlory && <Glory glory={glory} className="size-8" textClassName="text-xs" />}

          {stickers.length > 0 && (
            <View className="w-full flex-row flex-wrap items-center gap-1">
              {stickers.map((sticker, index) => (
                <StickerDisplay
                  key={`${sticker.id}-${index.toString()}`}
                  sticker={sticker}
                  className="size-7"
                />
              ))}
            </View>
          )}

          {/* Badges stack above the track so they never overlap. */}
          <View className="absolute inset-x-1 bottom-1 gap-1">
            {stayInPlay && (
              <View className="self-center rounded-lg bg-white/60 px-2 py-1">
                <Text className="text-ink-card text-center text-sm">
                  <PassifIcon className="text-ink-card size-4" />{' '}
                  {tCardPassiveLabel(t, stayInPlay.id)}
                </Text>
              </View>
            )}
            <ActionBadges
              hasPassive={hasPassive}
              hasTrigger={hasTrigger}
              hasDestroyAction={hasDestroyAction}
              hasAction={hasAction}
              actionIcon={actionIcon}
              hasAvailableDestroyAction={hasAvailableDestroyAction}
              hasAvailableAction={hasAvailableAction}
            />
            <MiniUpgrades upgrades={upgrades} />
            {!isBlocked && cs.track && (
              <MiniTrack steps={cs.track.steps} validatedSteps={instance.trackProgress} />
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
}
