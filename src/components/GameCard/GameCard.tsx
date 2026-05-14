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
  canAffordCost,
  cardIsBlocked,
  getActiveState,
  getEffectiveGlory,
  getEffectiveProductions,
  getEffectiveUpgradeCost,
  tagClass,
} from '@engine/application/cardHelpers';
import { getPickNumbers } from '@engine/application/effectResolver';
import { canUseOptions } from '@engine/application/gameStateHelper';
import { Options } from '@engine/domain/enums';
import type { CardInstance } from '@engine/domain/types';
import {
  tCardActionLabel,
  tCardDescription,
  tCardGloryLabel,
  tCardName,
  tCardPassiveLabel,
  tCardTag,
} from '@helpers/cardI18n';
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
  hideStatePreview = false,
  isOnBoard = false,
  className = '',
}: GameCardProps) {
  const { t } = useTranslation();
  const {
    gameState,
    defs,
    stickerDefs,
    resolveProduction,
    resolveUpgrade,
    setCardName,
    getCardName,
  } = useGame();
  const isBlocked = isOnBoard && cardIsBlocked(instance.id, gameState);
  const cs = getActiveState(instance, defs);
  const def = defs[instance.cardId];
  const isEnemy = cs.negative === true;
  const isPermanent = cs?.permanent;
  const isParchment = def?.parchmentCard ?? false;
  const productions = cs.productions?.map(base =>
    getEffectiveProductions(base, gameState, defs, instance, stickerDefs),
  ) ?? [getEffectiveProductions({}, gameState, defs, instance, stickerDefs)];
  const hasProductions = productions?.some(prod => Object.keys(prod).length > 0) ?? false;
  const canActivate = isOnBoard && !isBlocked;
  const upgrades = cs.upgrade ?? [];
  const actions = (cs.actions ?? []).filter(
    action =>
      action.limitedTime === undefined ||
      instance.usedActionIds.filter(usedId => usedId === action.id).length < action.limitedTime,
  );
  const rawCardName = t(`names.${instance.cardId}_${cs.id}`, { ns: 'cards' });
  const canChooseName = cs.chooseName === true && rawCardName.includes('_____');
  const [namePrefix, nameSuffix] = canChooseName ? rawCardName.split('_____') : ['', ''];
  const glory = getEffectiveGlory(cs, gameState, defs, instance, stickerDefs);
  const currentStateStickers = instance.stickers[instance.stateId] ?? [];
  const [name, setName] = useState(() => getCardName(instance.id));

  const emptyGloryBlock =
    (cs.glory?.emptyValues ?? 0) +
    (currentStateStickers?.reduce(
      (sum, stickerId) => sum + (stickerDefs[stickerId]?.additionalGlory ?? 0),
      0,
    ) ?? 0);
  const emptyValues: (number | undefined)[] = Array.from({
    length: emptyGloryBlock,
  }).map((_, i) => instance.glories[i]);

  const cardClass = [
    'min-w-32 max-w-80 aspect-2/3 rounded-md @3xs:rounded-xl',
    'border border-solid border-border relative flex-shrink-0 flex flex-col justify-between shadow-lg bg-card overflow-hidden',
  ]
    .filter(Boolean)
    .join(' ');

  const cardActionsClass =
    'font-body! bg-white/60 px-3! py-2! rounded-md text-xs text-base-ink backdrop-blur-sm @3xs:text-md';

  return (
    <div
      className={`${cardClass} ${className} ${isPermanent ? 'border-5 border-permanent' : ''}`}
      data-tour="card-root"
    >
      <div className={`border-b border-black/10 bg-black/5 p-1 pb-2 @3xs:p-3`}>
        <div className="flex items-start justify-between gap-2">
          <span
            className={`text-base-ink flex min-w-0 items-center gap-1 text-xs leading-tight @3xs:text-base`}
          >
            {instance.id !== 0 && (
              <span className={`mr-1 rounded bg-black/6 px-1 font-bold`} data-tour="card-number">
                #{instance.id}
              </span>
            )}
            <span
              className={`font-display truncate font-bold ${isEnemy ? 'text-tag-enemy' : ''}`}
              data-tour="card-name"
            >
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
                tCardName(t, cs.name || '')
              )}
            </span>
          </span>
          {!hideStatePreview && <CardStatePreview instance={instance} defs={defs} />}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1" data-tour="card-tags">
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
            <div data-tour="card-production">
              <ResourceChoice
                onSelect={choosenOption => resolveProduction(instance.id, choosenOption)}
                options={productions}
                disabled={!canActivate || !isOnBoard || isBlocked}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {cs.glory !== undefined && (cs.glory.amount !== 0 || cs.glory.valuePerElement) && (
              <Glory glory={glory} />
            )}
            {emptyValues.map((value, i) => (
              <Glory key={`empty-${i.toString()}`} glory={value} />
            ))}
          </div>

          {currentStateStickers.length > 0 && (
            <div className="flex flex-wrap gap-1" data-tour="card-glory">
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
          {cs.description && (
            <span className={`text-md italic text-base-ink/90 ${cardActionsClass}`}>
              {tCardDescription(t, instance.cardId, cs.id)}
            </span>
          )}
          {(cs.glory?.condition ?? cs.glory?.valuePerElement) && (
            <span className={cardActionsClass}>
              <PassifIcon className="size-3 @3xs:size-6" /> {tCardGloryLabel(t, def.id, cs.id)}
            </span>
          )}
          {(cs.passives ?? []).map(passive => (
            <span key={passive.id} className={cardActionsClass} data-tour="card-passive">
              <PassifIcon className="size-3 @3xs:size-6" />{' '}
              {tCardPassiveLabel(t, passive.id, instance.cumulated)}
            </span>
          ))}

          {!isBlocked &&
            !isParchment &&
            actions.map(action => {
              const actionLabel = tCardActionLabel(t, action.id, instance.cumulated);
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

          {!isBlocked && cs.track && (
            <CardTrack
              instance={instance}
              track={cs.track}
              validatedSteps={instance.trackProgress}
            />
          )}

          {!isBlocked &&
            upgrades.map(upg => {
              const effectiveUpgradeCost = getEffectiveUpgradeCost(
                upg.cost,
                gameState,
                defs,
                stickerDefs,
                instance.id,
              );
              const affordable = canAffordCost(
                effectiveUpgradeCost,
                instance.id,
                gameState,
                defs,
                stickerDefs,
              );
              const optionDisabled = !canUseOptions(gameState, Options.UPGRADE);
              const targetState = def?.states.find(s => s.id === upg.upgradeTo);
              const cardText = ({ name, tags }: { name?: string; tags?: string[] }) => {
                if (name) return t(`names.${name}`, { ns: 'cards' });
                if (tags && tags.length > 0) return t(`tags.${tags[0]}`, { ns: 'cards' });
                return t('card.cost.cards');
              };
              const discardLabel = effectiveUpgradeCost.discard
                ?.map(d => {
                  return t('card.cost.discard', {
                    count: getPickNumbers(d).pickMin,
                    type: cardText({ name: d.name, tags: d.tags }),
                  });
                })
                .join(', ');
              const destroyLabel = effectiveUpgradeCost.destroy
                ? t('card.cost.destroy', {
                    count: getPickNumbers(effectiveUpgradeCost.destroy).pickMin,
                    type: cardText({
                      name: effectiveUpgradeCost.destroy.name,
                      tags: effectiveUpgradeCost.destroy.tags,
                    }),
                  })
                : '';

              return (
                <Button
                  variant="text"
                  color="base-ink"
                  key={upg.upgradeTo}
                  onClick={() => resolveUpgrade(instance.id, upg.upgradeTo)}
                  disabled={!affordable || !canActivate || optionDisabled}
                  className={cardActionsClass}
                  data-tour="card-upgrade"
                >
                  ⬆{' '}
                  {targetState
                    ? tCardName(t, targetState.name || '')
                    : t('card.state', { id: upg.upgradeTo })}
                  {(effectiveUpgradeCost.resources?.[0] ?? discardLabel ?? destroyLabel) && (
                    <span>
                      {' '}
                      (
                      {Object.entries(effectiveUpgradeCost.resources?.[0] ?? {}).map(
                        ([k, v], ci) => {
                          const meta = getResMeta(k);
                          return (
                            <React.Fragment key={k}>
                              {ci > 0 && ', '}
                              {v}
                              {meta.icon && (
                                <meta.icon
                                  className="size-4 align-middle"
                                  color={meta.color}
                                  alt={k}
                                />
                              )}
                            </React.Fragment>
                          );
                        },
                      )}{' '}
                      {discardLabel}
                      {destroyLabel})
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
