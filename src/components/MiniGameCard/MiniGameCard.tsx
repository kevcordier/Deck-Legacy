import { Glory } from '@components/ui/Glory/Glory';
import { UpgradeIcon } from '@components/ui/Icon/icon';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
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
import { Options } from '@engine/domain/enums';
import type { CardInstance } from '@engine/domain/types';
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
  const { gameState, defs, stickerDefs, getCardName } = useGame();
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
  const nonEmptyProductions = productions?.filter(prod => Object.keys(prod).length > 0) ?? [];
  const firstProduction = nonEmptyProductions[0];
  const hasMoreProductions = nonEmptyProductions.length > 1;

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
  const hasAvailableAction =
    isOnBoard &&
    !isBlocked &&
    actions.some(action => {
      if (action.trigger) return false;
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
    });

  return (
    <>
      <div
        className={`relative aspect-3/5 w-full min-w-16 shrink-0 overflow-hidden rounded-md border border-border bg-card shadow-md ${className} ${hasAvailableAction && 'ring-3 ring-primary'}`}
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

          {firstProduction && (
            <div className="flex">
              <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-card px-1.5 py-1 shadow-sm">
                {Object.entries(firstProduction).map(([key, val]) =>
                  (val ?? 0) > 2 ? (
                    <div key={key} className="flex items-center gap-0">
                      <ResourcePill resource={key} className="size-5" />
                      <span className="leading-none font-bold text-base-ink">x{val}</span>
                    </div>
                  ) : (
                    Array.from({ length: val ?? 0 }, (_, i) => (
                      <ResourcePill
                        key={`${key}-${i.toString()}`}
                        resource={key}
                        className="size-5"
                      />
                    ))
                  ),
                )}
              </div>
              {hasMoreProductions && (
                <span className="flex shrink-0 items-center content-center gap-0.5 rounded-full border border-border bg-card px-2.5 py-0.5 shadow-sm">
                  +
                </span>
              )}
            </div>
          )}
          {hasGlory && <Glory glory={glory} className="size-8! text-xs" />}

          {hasUpgrade && (
            <span
              className={`absolute bottom-1 right-1 text-sm rounded-full border border-border bg-card px-2 py-1 shadow-sm text-base-ink ${!hasAvailableUpgrade && 'text-gray'}`}
              aria-label={t('card.upgradeAvailable')}
            >
              <UpgradeIcon className="size-3" />
            </span>
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
