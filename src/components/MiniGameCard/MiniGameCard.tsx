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
} from '@engine/application/cardHelpers';
import { canUseOptions } from '@engine/application/gameStateHelper';
import { Options, TargetScope } from '@engine/domain/enums';
import type { CardAction, CardInstance } from '@engine/domain/types';
import { tCardName } from '@helpers/cardI18n';
import { useGame } from '@hooks/useGame';
import { useTranslation } from 'react-i18next';

type MiniGameCardProps = {
  readonly instance: CardInstance;
  readonly isOnBoard?: boolean;
  readonly className?: string;
};

export function MiniGameCard({ instance, isOnBoard = false, className = '' }: MiniGameCardProps) {
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

  const productions =
    cs.productions?.flatMap(base =>
      getProductionChoicesForAction(base, gameState, defs, instance, stickerDefs),
    ) ?? getProductionChoicesForAction({}, gameState, defs, instance, stickerDefs);
  const hasProductions = productions?.some(prod => Object.keys(prod).length > 0) ?? false;
  const canActivate = isOnBoard && !isBlocked;

  const glory = getEffectiveGlory(cs, gameState, defs, instance, stickerDefs);
  const hasGlory = cs.glory !== undefined && (cs.glory.amount !== 0 || cs.glory.valuePerElement);

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
    <>
      <div
        className={`relative aspect-3/5 w-full min-w-16 shrink-0 overflow-hidden rounded-md border border-border bg-card shadow-md ${className}`}
        data-tour="card-root"
      >
        {cs.illustration && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${cs.illustration})` }}
            />
            <div className="absolute inset-x-0 bottom-0 z-0 h-4/5 bg-linear-to-t from-card via-card/70 to-transparent" />
          </>
        )}

        <div className="absolute inset-0 flex flex-col items-start gap-1 p-1 pt-2">
          <Tag label={displayName} className={`${titleColorClass} bg-black/60 `} />

          {hasProductions && productions && (
            <div data-tour="card-production">
              <ResourceChoice
                onSelect={choosenOption => resolveProduction(instance.id, choosenOption)}
                options={productions}
                disabled={!canActivate}
                pillClassName="size-5"
              />
            </div>
          )}
          {hasGlory && <Glory glory={glory} className="size-8! text-xs" />}

          {(hasPassive || hasTrigger || hasDestroyAction || hasAction || hasUpgrade) && (
            <div className="absolute bottom-1 right-1 flex flex-wrap-reverse items-end justify-end gap-0.5">
              {hasPassive && (
                <span
                  className="rounded-full border border-border bg-card p-1 text-sm text-base-ink shadow-sm"
                  aria-label={t('card.hasPassive')}
                >
                  <PassifIcon className="size-3" />
                </span>
              )}
              {hasTrigger && (
                <span
                  className="rounded-full border border-border bg-card p-1 text-sm text-base-ink shadow-sm"
                  aria-label={t('card.hasTrigger')}
                >
                  <TriggerIcon className="size-3" />
                </span>
              )}
              {hasDestroyAction && (
                <span
                  className={`rounded-full border border-border bg-card p-1 text-sm shadow-sm ${hasAvailableDestroyAction && 'ring-1 ring-base-primary'}`}
                  aria-label={t('card.destroyActionAvailable')}
                >
                  <DestroyIcon
                    className="size-3"
                    color={hasAvailableDestroyAction ? 'red' : 'gray'}
                  />
                </span>
              )}
              {hasAction && (
                <span
                  className={`rounded-full border border-border bg-card p-1 text-sm shadow-sm ${hasAvailableAction && 'ring-1 ring-base-primary'}`}
                  aria-label={t('card.actionAvailable')}
                >
                  <ActivatedIcon className="size-3" color={hasAvailableAction ? 'green' : 'gray'} />
                </span>
              )}
              {hasUpgrade && (
                <span
                  className={`rounded-full border border-border bg-card p-1 text-sm shadow-sm ${hasAvailableUpgrade ? 'text-base-ink ring-1 ring-base-primary' : 'text-gray'}`}
                  aria-label={t('card.upgradeAvailable')}
                >
                  <UpgradeIcon className="size-3" />
                </span>
              )}
            </div>
          )}
          {!isBlocked && cs.track && (
            <div className="absolute inset-x-0 bottom-1 flex flex-wrap items-center justify-center gap-0.5 px-1">
              {cs.track.steps.map(step => {
                const isValidated = instance.trackProgress.includes(step.id);
                return (
                  <span
                    key={step.id}
                    className={`size-4 shrink-0 rounded-sm border text-xs align-middle text-center ${
                      isValidated
                        ? 'border-success bg-success/20! text-success'
                        : 'border-b-base-ink/70 bg-base-ink/10'
                    }`}
                  >
                    {isValidated ? '✓' : undefined}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
