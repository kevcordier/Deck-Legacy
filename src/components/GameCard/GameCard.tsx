import React from 'react';
import { useTranslation } from 'react-i18next';
import { tCardName, tCardActionLabel, tCardActionDescription, tCardTag } from '@i18n/cardI18n';
import {
  getActiveState,
  getEffectiveProductions,
  tagClass,
  canAffordResources,
} from '@engine/application/cardHelpers';
import { renderTextWithIcons } from '@engine/application/renderHelpers';
import { getResMeta } from '@engine/application/resourceHelpers';
import { CardStatePreview } from '@components/CardStatePreview';
import { CardTrack } from '@components/CardTrack';
import { ResourceList } from '@components/ResourceChoice/ResourceList';
import { ResourcePill } from '@components/ResourcePill/ResourcePill';
import type { CardInstance, Resources } from '@engine/domain/types';
import { TargetScope } from '@engine/domain/enums';
import { ActivatedIcon, DestroyIcon, PassifIcon, TimeIcon, TriggerIcon } from '@components/ui/Icon';
import { useGame } from '@hooks/useGame';
import { Button } from '@components/ui/Button/Button';
import { Glory } from '@components/ui/Glory/Glory';

interface GameCardProps {
  instance: CardInstance;
  style?: React.CSSProperties;
  index?: number;
  hideStatePreview?: boolean;
  isOnBoard?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GameCard({
  instance,
  index = 0,
  hideStatePreview = false,
  isOnBoard = false,
  size = 'md',
  className = '',
}: GameCardProps) {
  const { t } = useTranslation();
  const {
    state,
    defs,
    stickerDefs,
    resolveProduction,
    resolveAction,
    resolveUpgrade,
    resolveTrackStep,
  } = useGame();
  const currentResources = state.resources;
  const isBlocked = isOnBoard && Object.values(state.blockingCards ?? {}).includes(instance.id);
  const cs = getActiveState(instance, defs);
  const def = defs[instance.cardId];
  const isEnemy = cs.negative === true;
  const isPermanent = def?.permanent;
  const isParchment = def?.parchmentCard ?? false;
  const sc = getActiveState(instance, defs);
  const base = sc.productions?.[0] || {};
  const productions = getEffectiveProductions(base, instance, stickerDefs);
  const hasProductions = Object.keys(productions).length > 0;
  const canActivate = isOnBoard && !isBlocked;
  const upgrades = cs.upgrade ?? [];
  const actions = cs.cardEffects ?? [];
  const glory = cs.glory ?? 0;
  const resourceOptions = cs.productions as Resources[] | undefined;
  const currentStateStickers = instance.stickers[instance.stateId] ?? [];

  const sizeClass =
    size === 'sm'
      ? 'w-56 h-80 rounded-md'
      : size === 'lg'
        ? 'w-84 h-120 rounded-lg'
        : 'w-70 h-100 rounded-lg';

  const cardClass = [
    sizeClass,
    ' border border-solid border-border relative flex-shrink-0 flex flex-col justify-between shadow-lg bg-card overflow-hidden animate-fade-in-scale',
    isEnemy ? 'enemy' : '',
    isBlocked ? 'blocked' : '',
    isPermanent ? 'permanent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const animationDelayClass = [`delay-50`, `delay-100`, `delay-1500`, `delay-200`][index];

  return (
    <div
      className={`${cardClass} ${className} ${animationDelayClass} ${isPermanent ? 'border-5 border-gray-400' : ''}`}
    >
      {isBlocked && (
        <div className="bg-opacity-50 absolute inset-0 z-20 flex items-center justify-center bg-red-950/60">
          <span className="font-display text-danger rounded bg-black px-2 py-1 uppercase">
            {t('card.blocked')}
          </span>
        </div>
      )}

      <div className={`border-b border-black/10 bg-black/5 p-3 pb-2`}>
        <div className="flex items-start justify-between gap-2">
          <span
            className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-base-ink flex items-center gap-1`}
          >
            {instance.id !== undefined && instance.id !== 0 && (
              <span className={`mr-1 rounded bg-black/6 px-1 font-bold`}>#{instance.id}</span>
            )}
            <span className={`font-display font-bold ${isEnemy ? 'text-red-600' : ''}`}>
              {tCardName(t, instance.cardId, cs.id, cs.name)}
            </span>
          </span>
          {!hideStatePreview && <CardStatePreview instance={instance} defs={defs} />}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1">
          {(cs.tags ?? []).map(tag => (
            <span
              key={tag}
              className={`${tagClass(tag, isEnemy)} font-display inline-block gap-1 rounded px-1.5 py-0.5 ${size === 'sm' ? 'px-0.5 text-xs' : size === 'lg' ? 'text-md' : 'text-xs'} text-base-ink`}
            >
              {tCardTag(t, tag)}
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {cs.illustration && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url(${cs.illustration})` }}
          />
        )}

        <div className="relative z-10 flex flex-1 flex-col items-start gap-2 p-3">
          {hasProductions && (
            <Button
              onClick={() => resolveProduction(instance.id)}
              disabled={!canActivate || !isOnBoard || isBlocked}
              title={t('card.chooseProduction')}
              size={size}
              variant="text"
            >
              <ResourceList resourceOptions={resourceOptions} size={size} />
            </Button>
          )}

          {glory !== 0 && <Glory glory={glory} size={size} />}

          {isParchment &&
            actions.map((action, i) => {
              return (
                <div className="flex flex-col gap-2" key={i}>
                  <span className="font-display text-base-ink text-center text-2xl font-semibold">
                    {tCardActionLabel(t, instance.cardId, cs.id, i, action.label)}
                  </span>
                  {action.description && (
                    <p
                      className={`text-center text-gray-600 italic ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-md'}`}
                    >
                      {renderTextWithIcons(action.description)}
                    </p>
                  )}
                </div>
              );
            })}

          {currentStateStickers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {currentStateStickers.map((stickerId, i) => {
                const sticker = stickerDefs[stickerId];
                if (!sticker) return null;
                if (sticker.production)
                  return <ResourcePill key={i} resource={sticker.production} size={size} />;
                if (sticker.glory) return <Glory key={i} glory={sticker.glory} size={size} />;
                return null;
              })}
            </div>
          )}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-2 p-3 pt-0">
          {cs.stayInPlay && (
            <span
              className={`text-base-ink flex items-center gap-1 rounded bg-white/60 px-3 py-2 backdrop-blur-sm ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}`}
            >
              <PassifIcon
                className={`align-text-bottom ${size === 'sm' ? 'size-4' : size === 'lg' ? 'size-6' : 'size-5'}`}
                alt="passif"
              />{' '}
              {t('card.stayInPlay')}
            </span>
          )}

          {!isBlocked &&
            !isParchment &&
            actions.map((action, i) => {
              const affordable = !action.cost || canAffordResources(currentResources, action.cost);
              const actionLabel = tCardActionLabel(t, instance.cardId, cs.id, i, action.label);
              const actionDesc = tCardActionDescription(t, instance.cardId, cs.id, i, actionLabel);
              const hasDestroyItselfCost = action.cost?.destroy?.scope === TargetScope.SELF;
              const haveTrigger = !!action.trigger;
              const isOptional = action.optional;
              return (
                <Button
                  key={i}
                  onClick={() => resolveAction(instance.id, action.label)}
                  disabled={!affordable || !canActivate || haveTrigger}
                  title={actionDesc}
                  variant="text"
                  color="base-ink"
                  className={`font-body! bg-white/60 backdrop-blur-sm ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'} ${haveTrigger ? 'cursor-not-allowed' : ''}`}
                >
                  {haveTrigger && !isOptional ? (
                    <TriggerIcon
                      color="red"
                      className={`${size === 'sm' ? 'size-4' : size === 'lg' ? 'size-6' : 'size-5'}`}
                    />
                  ) : haveTrigger && isOptional ? (
                    <TriggerIcon
                      color="yellow"
                      className={`${size === 'sm' ? 'size-4' : size === 'lg' ? 'size-6' : 'size-5'}`}
                    />
                  ) : hasDestroyItselfCost ? (
                    <DestroyIcon
                      color="red"
                      className={`${size === 'sm' ? 'size-4' : size === 'lg' ? 'size-6' : 'size-5'}`}
                    />
                  ) : action.endsTurn ? (
                    <TimeIcon
                      className={`${size === 'sm' ? 'size-4' : size === 'lg' ? 'size-6' : 'size-5'}`}
                    />
                  ) : action.passive ? (
                    <PassifIcon
                      className={`${size === 'sm' ? 'size-4' : size === 'lg' ? 'size-6' : 'size-5'}`}
                    />
                  ) : (
                    <ActivatedIcon
                      color="green"
                      className={`${size === 'sm' ? 'size-4' : size === 'lg' ? 'size-6' : 'size-5'}`}
                    />
                  )}{' '}
                  {renderTextWithIcons(actionLabel)}
                </Button>
              );
            })}

          {!isBlocked && cs.track && (
            <CardTrack
              track={cs.track}
              validatedSteps={instance.trackProgress}
              currentResources={currentResources}
              canActivate={canActivate}
              onStep={stepId => resolveTrackStep(instance.id, stepId)}
              size={size}
            />
          )}

          {!isBlocked &&
            upgrades.map((upg, i) => {
              const affordable = canAffordResources(currentResources, upg.cost);
              const targetState = def?.states.find(s => s.id === upg.upgradeTo);
              return (
                <Button
                  variant="text"
                  color="base-ink"
                  key={i}
                  onClick={() => resolveUpgrade(instance.id, upg.upgradeTo)}
                  disabled={!affordable || !canActivate}
                  className={`font-body! bg-white/60 backdrop-blur-sm ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}`}
                >
                  ⬆{' '}
                  {targetState
                    ? tCardName(t, def.id, targetState.id, targetState.name)
                    : t('card.state', { id: upg.upgradeTo })}
                  {upg.cost.resources?.[0] && (
                    <span className="gc-action-cost">
                      (
                      {Object.entries(upg.cost.resources[0]).map(([k, v], ci) => {
                        const meta = getResMeta(k);
                        return (
                          <React.Fragment key={k}>
                            {ci > 0 && ', '}
                            {v}
                            {meta.icon && (
                              <meta.icon className={`size-4 align-middle ${meta.cls}`} alt={k} />
                            )}
                          </React.Fragment>
                        );
                      })}
                      )
                    </span>
                  )}
                </Button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
