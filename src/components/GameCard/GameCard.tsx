import { CardAction } from '@components/CardAction/CardAction';
import { CardStatePreview } from '@components/CardStatePreview/CardStatePreview';
import { CardTrack } from '@components/CardTrack/CardTrack';
import { Button } from '@components/ui/Button/Button';
import { Glory } from '@components/ui/Glory/Glory';
import { PassifIcon } from '@components/ui/Icon/icon';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { StickerDisplay } from '@components/ui/StickerDisplay/StickerDisplay';
import { Tag } from '@components/ui/Tag/Tag';
import {
  canAffordResources,
  cardIsBlocked,
  getActiveState,
  getEffectiveGlory,
  getEffectiveProductions,
  tagClass,
} from '@engine/application/cardHelpers';
import type { CardInstance } from '@engine/domain/types';
import { tCardActionLabel, tCardName, tCardPassiveLabel, tCardTag } from '@helpers/cardI18n';
import { getResMeta } from '@helpers/renderHelpers';
import { useGame } from '@hooks/useGame';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface GameCardProps {
  readonly instance: CardInstance;
  readonly index?: number;
  readonly hideStatePreview?: boolean;
  readonly isOnBoard?: boolean;
  readonly className?: string;
}

export function GameCard({
  instance,
  index = 0,
  hideStatePreview = false,
  isOnBoard = false,
  className = '',
}: GameCardProps) {
  const { t } = useTranslation();
  const { state, defs, stickerDefs, resolveProduction, resolveUpgrade, setCardName, getCardName } =
    useGame();
  const currentResources = state.resources;
  const isBlocked = isOnBoard && cardIsBlocked(instance.id, state);
  const cs = getActiveState(instance, defs);
  const def = defs[instance.cardId];
  const isEnemy = cs.negative === true;
  const isPermanent = def?.permanent;
  const isParchment = def?.parchmentCard ?? false;
  const productions = cs.productions?.map(base =>
    getEffectiveProductions(base, cs, state, defs, instance, stickerDefs),
  ) || [getEffectiveProductions({}, cs, state, defs, instance, stickerDefs)];
  const hasProductions = productions?.some(prod => Object.keys(prod).length > 0) ?? false;
  const canActivate = isOnBoard && !isBlocked;
  const upgrades = cs.upgrade ?? [];
  const actions = (cs.actions ?? []).filter(
    action => !action.onTime || !instance.usedActionIds.includes(action.id),
  );
  const rawCardName = t(`names.${instance.cardId}_${cs.id}`, { ns: 'cards' });
  const canChooseName = cs.chooseName === true && rawCardName.includes('_____');
  const [namePrefix, nameSuffix] = canChooseName ? rawCardName.split('_____') : ['', ''];
  const glory = getEffectiveGlory(cs, state, defs, instance, stickerDefs);
  const currentStateStickers = instance.stickers[instance.stateId] ?? [];
  const [name, setName] = useState(() => getCardName(instance.id));

  const cardClass = [
    'min-w-32 max-w-100 aspect-2/3 rounded-md @3xs:rounded-xl',
    'border border-solid border-border relative flex-shrink-0 flex flex-col justify-between shadow-lg bg-card overflow-hidden animate-fade-in-scale',
  ]
    .filter(Boolean)
    .join(' ');

  const animationDelayClass = [`delay-50`, `delay-100`, `delay-1500`, `delay-200`][index];

  const cardActionsClass =
    'font-body! bg-white/60 px-3! py-2! rounded-md text-xs text-base-ink backdrop-blur-sm @3xs:text-md';

  return (
    <div
      className={`${cardClass} ${className} ${animationDelayClass} ${isPermanent ? 'border-5 border-permanent' : ''}`}
    >
      <div className={`border-b border-black/10 bg-black/5 p-1 pb-2 @3xs:p-3`}>
        <div className="flex items-start justify-between gap-2">
          <span
            className={`text-base-ink flex min-w-0 items-center gap-1 text-xs leading-tight @3xs:text-base`}
          >
            {instance.id !== 0 && (
              <span className={`mr-1 rounded bg-black/6 px-1 font-bold`}>#{instance.id}</span>
            )}
            <span className={`font-display truncate font-bold ${isEnemy ? 'text-tag-enemy' : ''}`}>
              {canChooseName ? (
                <span className="inline-flex min-w-0 items-baseline gap-1">
                  {namePrefix}
                  <input
                    type="text"
                    value={name ?? ''}
                    onChange={event => setName(event.currentTarget.value)}
                    onBlur={() => setCardName(instance.id, name ?? '')}
                    className={`min-w-8 flex-1 border-0 bg-transparent cursor-text p-0 text-inherit outline-none ${name ? '' : 'border-b border-base-ink'}`}
                    aria-label={t('card.name')}
                  />
                  {nameSuffix}
                </span>
              ) : (
                tCardName(t, instance.cardId, cs.id)
              )}
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
          <>
            <div
              className="absolute inset-0 z-0 bg-cover bg-center opacity-60"
              style={{ backgroundImage: `url(${cs.illustration})` }}
            />
            <div className="absolute inset-x-0 bottom-0 z-0 h-2/3 bg-linear-to-t from-card via-card/70 to-transparent" />
          </>
        )}

        <div className={`relative z-10 flex flex-1 flex-col items-start gap-1 p-1 @3xs:p-3`}>
          {hasProductions && productions && (
            <ResourceChoice
              onSelect={choosenOption => resolveProduction(instance.id, choosenOption)}
              options={productions}
              disabled={!canActivate || !isOnBoard || isBlocked}
            />
          )}

          {cs.glory !== undefined && <Glory glory={glory} />}

          {currentStateStickers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {currentStateStickers.map((stickerId, index) => {
                const sticker = stickerDefs[stickerId];
                if (!sticker) return null;
                return (
                  <StickerDisplay
                    key={`${stickerId}-${index.toString()}`}
                    sticker={sticker}
                    size="md"
                    className="rounded-md bg-white/70 border-2 border-danger p-1"
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className={`relative z-10 flex flex-col items-center gap-1 p-1 @3xs:p-3`}>
          {(cs.passives ?? []).map((passive, i) => (
            <span key={passive.id} className={cardActionsClass}>
              <PassifIcon className="size-3 @3xs:size-6" />{' '}
              {passive.type === 'STAY_IN_PLAY'
                ? t('card.stayInPlay')
                : tCardPassiveLabel(t, def.id, cs.id, i, instance.cumulated)}
            </span>
          ))}

          {!isBlocked &&
            !isParchment &&
            actions.map((action, i) => {
              const actionLabel = tCardActionLabel(
                t,
                instance.cardId,
                cs.id,
                i,
                instance.cumulated,
              );
              return (
                <CardAction
                  key={action.id}
                  instance={instance}
                  action={action}
                  actionLabel={actionLabel}
                  disabled={!canActivate}
                />
              );
            })}

          {!isBlocked &&
            upgrades.map(upg => {
              const affordable = canAffordResources(currentResources, upg.cost);
              const targetState = def?.states.find(s => s.id === upg.upgradeTo);
              return (
                <Button
                  variant="text"
                  color="base-ink"
                  key={upg.upgradeTo}
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

        {!isBlocked && cs.track && (
          <div className="z-10 flex flex-col items-center justify-center gap-1 p-1 @3xs:p-2">
            <CardTrack
              instance={instance}
              track={cs.track}
              validatedSteps={instance.trackProgress}
            />
          </div>
        )}
      </div>
    </div>
  );
}
