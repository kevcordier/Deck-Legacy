import { CardAction } from '@components/CardAction/CardAction';
import { CardStatePreview } from '@components/CardStatePreview/CardStatePreview';
import { CardTrack } from '@components/CardTrack/CardTrack';
import { Button } from '@components/ui/Button/Button';
import { Glory } from '@components/ui/Glory/Glory';
import { PassifIcon } from '@components/ui/Icon/icon';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import { Tag } from '@components/ui/Tag/Tag';
import {
  canAffordResources,
  cardIsBlocked,
  getActiveState,
  getEffectiveProductions,
  tagClass,
} from '@engine/application/cardHelpers';
import type { CardInstance } from '@engine/domain/types';
import { tCardActionLabel, tCardName, tCardTag } from '@helpers/cardI18n';
import { getResMeta } from '@helpers/renderHelpers';
import { useGame } from '@hooks/useGame';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface GameCardProps {
  instance: CardInstance;
  style?: React.CSSProperties;
  index?: number;
  hideStatePreview?: boolean;
  isOnBoard?: boolean;
  className?: string;
}

export function GameCard({
  instance,
  index = 0,
  hideStatePreview = false,
  isOnBoard = false,
  className = '',
}: GameCardProps) {
  const { t } = useTranslation();
  const { state, defs, stickerDefs, resolveProduction, resolveUpgrade, resolveTrackStep } =
    useGame();
  const currentResources = state.resources;
  const isBlocked = isOnBoard && cardIsBlocked(instance.id, state);
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
  const actions = cs.actions ?? [];
  const glory = cs.glory ?? 0;
  const resourceOptions = cs.productions ?? undefined;
  const currentStateStickers = instance.stickers[instance.stateId] ?? [];

  const cardClass = [
    'min-w-32 max-w-100 aspect-2/3 rounded-md @3xs/card:rounded-xl',
    'border border-solid border-border relative flex-shrink-0 flex flex-col justify-between shadow-lg bg-card overflow-hidden animate-fade-in-scale',
  ]
    .filter(Boolean)
    .join(' ');

  const animationDelayClass = [`delay-50`, `delay-100`, `delay-1500`, `delay-200`][index];

  const cardActionsClass =
    'font-body! bg-white/60 px-3! py-2! rounded-md text-xs text-base-ink backdrop-blur-sm @3xs/card:text-lg';

  return (
    <div className="@container/card w-full">
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

        <div className={`border-b border-black/10 bg-black/5 p-1 pb-2 @3xs/card:p-3`}>
          <div className="flex items-start justify-between gap-2">
            <span
              className={`text-base-ink flex min-w-0 items-center gap-1 text-xs leading-tight @3xs/card:text-base`}
            >
              {instance.id !== undefined && instance.id !== 0 && (
                <span className={`mr-1 rounded bg-black/6 px-1 font-bold`}>#{instance.id}</span>
              )}
              <span className={`font-display truncate font-bold ${isEnemy ? 'text-red-600' : ''}`}>
                {tCardName(t, instance.cardId, cs.id)}
              </span>
            </span>
            {!hideStatePreview && <CardStatePreview instance={instance} defs={defs} />}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1">
            {(cs.tags ?? []).map(tag => (
              <Tag key={tag} label={tCardTag(t, tag)} className={tagClass(tag, isEnemy)} />
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

          <div className={`relative z-10 flex flex-1 flex-col items-start gap-1 p-1 @3xs/card:p-3`}>
            {hasProductions && resourceOptions && (
              <ResourceChoice
                onSelect={choosenOption => resolveProduction(instance.id, choosenOption)}
                options={resourceOptions}
                disabled={!canActivate || !isOnBoard || isBlocked}
              />
            )}

            {glory !== 0 && <Glory glory={glory} />}

            {currentStateStickers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {currentStateStickers.map((stickerId, i) => {
                  const sticker = stickerDefs[stickerId];
                  if (!sticker) return null;
                  if (sticker.production)
                    return <ResourcePill key={i} resource={sticker.production} />;
                  if (sticker.glory) return <Glory key={i} glory={sticker.glory} />;
                  return null;
                })}
              </div>
            )}
          </div>

          <div className={`relative z-10 flex flex-col items-center gap-1 p-1 @3xs/card:p-3`}>
            {cs.passives && (
              <span className={cardActionsClass}>
                <PassifIcon className="size-3 @3xs/card:size-6" /> {t('card.stayInPlay')}
              </span>
            )}

            {!isBlocked &&
              !isParchment &&
              actions.map((action, i) => {
                const actionLabel = tCardActionLabel(t, instance.cardId, cs.id, i);
                return (
                  <CardAction
                    key={i}
                    instanceId={instance.id}
                    action={action}
                    actionLabel={actionLabel}
                    disabled={!canActivate}
                  />
                );
              })}

            {!isBlocked && cs.track && (
              <CardTrack
                track={cs.track}
                validatedSteps={instance.trackProgress}
                currentResources={currentResources}
                canActivate={canActivate}
                onStep={stepId => resolveTrackStep(instance.id, stepId)}
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
                    className={cardActionsClass}
                  >
                    ⬆{' '}
                    {targetState
                      ? tCardName(t, def.id, targetState.id)
                      : t('card.state', { id: upg.upgradeTo })}
                    {upg.cost.resources?.[0] && (
                      <span>
                        {' '}
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
    </div>
  );
}
