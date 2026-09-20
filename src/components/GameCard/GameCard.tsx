import { CardAction } from '@components/CardAction/CardAction';
import { CardStatePreview } from '@components/CardStatePreview/CardStatePreview';
import { CardTrack } from '@components/CardTrack/CardTrack';
import { Button } from '@components/ui/Button/Button';
import { Glory } from '@components/ui/Glory/Glory';
import { PassifIcon, UpgradeIcon } from '@components/ui/Icon/icon';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { StickerDisplay } from '@components/ui/StickerDisplay/StickerDisplay';
import { Tag } from '@components/ui/Tag/Tag';
import {
  canAffordCost,
  cardIsBlocked,
  getActiveState,
  getEffectiveGlory,
  getEffectiveUpgradeCost,
  getProductionChoicesForAction,
  tagClass,
} from '@engine/application/cardHelpers';
import { getPickNumbers } from '@engine/application/effectResolver';
import { canUseOptions } from '@engine/application/gameStateHelper';
import { Options } from '@engine/domain/enums';
import type { CardInstance } from '@engine/domain/types';
import {
  tCardActionLabel,
  tCardGloryLabel,
  tCardName,
  tCardPassiveLabel,
  tCardTag,
} from '@helpers/cardI18n';
import { getResMeta } from '@helpers/renderHelpers';
import { useGame } from '@hooks/useGame';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Tilt, { type OnMoveParams } from 'react-parallax-tilt';

interface GameCardProps {
  readonly instance: CardInstance;
  readonly hideStatePreview?: boolean;
  readonly isOnBoard?: boolean;
  readonly allowTilt?: boolean;
  readonly className?: string;
  readonly size?: 'md' | 'lg';
}

const CARD_TILT_MAX_DEG = 5;
const CARD_TILT_PERSPECTIVE = 800;
const ILLUSTRATION_SCALE = 1.1;
const ILLUSTRATION_PARALLAX_STRENGTH = 4;

function getSizeClasses(size: 'md' | 'lg') {
  if (size === 'lg') {
    return {
      cardActionsClass:
        'font-body! bg-white/60 p-2! rounded-md text-base! text-base-ink backdrop-blur-sm',
      headerPaddingClass: 'p-3! gap-2!',
      nameTextClass: 'text-lg!',
      bodyPaddingClass: 'p-3!',
      pillSizeClass: 'size-8!',
      glorySizeClass: 'size-14! text-base!',
      passifIconClass: 'size-6!',
      resourceIconClass: 'size-6!',
      tagSizeClass: 'px-2! py-1! text-base!',
    };
  }
  return {
    cardActionsClass:
      'font-body! bg-white/60 p-1! @3xs:p-2! rounded-md text-xs text-base-ink backdrop-blur-sm @3xs:text-md',
    headerPaddingClass: 'p-1 @3xs:px-3 @3xs:py-2 gap-1 @3xs:gap-2',
    nameTextClass: 'text-xs leading-tight @3xs:text-base',
    bodyPaddingClass: 'p-1 @3xs:p-2',
    pillSizeClass: 'size-4 @3xs:size-6',
    glorySizeClass: 'size-8! text-xs @3xs:size-10! @3xs:text-md',
    passifIconClass: 'size-3 @3xs:size-6',
    resourceIconClass: 'size-4',
    tagSizeClass: '',
  };
}

export function GameCard({
  instance,
  hideStatePreview = false,
  isOnBoard = false,
  allowTilt = false,
  className = '',
  size = 'md',
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
  const productions =
    cs.productions?.flatMap(base =>
      getProductionChoicesForAction(base, gameState, defs, instance, stickerDefs),
    ) ?? getProductionChoicesForAction({}, gameState, defs, instance, stickerDefs);
  const hasProductions = productions?.some(prod => Object.keys(prod).length > 0) ?? false;
  const canActivate = isOnBoard && !isBlocked;
  const upgrades = cs.upgrade ?? [];
  const actions = (cs.actions ?? []).filter(
    action =>
      action.limitedTime === undefined ||
      instance.usedActionIds.filter(usedId => usedId === action.id).length < action.limitedTime,
  );
  const rawCardName = t(`names.${cs.name}`, { ns: 'cards' });
  const canChooseName = cs.chooseName === true && rawCardName.includes('_____');
  const [namePrefix, nameSuffix] = canChooseName ? rawCardName.split('_____') : ['', ''];
  const glory = getEffectiveGlory(cs, gameState, defs, instance, stickerDefs);
  const currentStateStickers = instance.stickers[instance.stateId] ?? [];
  const [name, setName] = useState(() => getCardName(instance.id));

  const illustrationRef = useRef<HTMLDivElement | null>(null);

  const handleIllustrationTiltMove = ({
    tiltAngleXPercentage,
    tiltAngleYPercentage,
  }: OnMoveParams) => {
    if (!illustrationRef.current) return;
    const parallaxX = (tiltAngleYPercentage / 100) * ILLUSTRATION_PARALLAX_STRENGTH;
    const parallaxY = (tiltAngleXPercentage / 100) * ILLUSTRATION_PARALLAX_STRENGTH;
    illustrationRef.current.style.transform = `scale(${ILLUSTRATION_SCALE}) translate(${parallaxX}%, ${parallaxY}%)`;
  };

  const resetIllustrationTilt = () => {
    if (illustrationRef.current) {
      illustrationRef.current.style.transform = `scale(${ILLUSTRATION_SCALE})`;
    }
  };

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
    'min-w-32 w-full max-w-80 aspect-3/5 @container rounded-md @3xs:rounded-xl',
    'border border-solid border-border relative flex-shrink-0 flex flex-col justify-between shadow-lg bg-card overflow-hidden',
  ]
    .filter(Boolean)
    .join(' ');

  const {
    cardActionsClass,
    headerPaddingClass,
    nameTextClass,
    bodyPaddingClass,
    pillSizeClass,
    glorySizeClass,
    passifIconClass,
    resourceIconClass,
    tagSizeClass,
  } = getSizeClasses(size);

  const content = (
    <div
      className={`${cardClass} ${className} ${isPermanent ? 'border-t-5 border-permanent' : ''}`}
      data-tour="card-root"
    >
      <div className={`border-b border-black/10 bg-black/5 ${headerPaddingClass}`}>
        <div className="flex items-start justify-between gap-2">
          <span className={`text-base-ink flex min-w-0 items-center gap-1 ${nameTextClass}`}>
            {instance.id !== 0 && (
              <span className={`mr-1 rounded bg-black/6 px-1 font-bold`} data-tour="card-number">
                #{instance.id}
              </span>
            )}
            <span
              className={`font-display font-bold ${isEnemy ? 'text-tag-enemy' : ''}`}
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

        <div className="flex flex-wrap items-center gap-1" data-tour="card-tags">
          {(cs.tags ?? []).map(tag => (
            <Tag
              key={tag}
              label={tCardTag(t, tag)}
              className={`${tagClass(tag, isEnemy)} ${tagSizeClass}`}
            />
          ))}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden shadow-[inset_0_0_2rem_0.5rem_rgba(0,0,0,0.6)]">
        {cs.illustration && (
          <>
            <div
              ref={illustrationRef}
              className="absolute inset-0 z-0 bg-cover bg-bottom transition-transform duration-150 ease-out"
              style={{
                backgroundImage: `url(${cs.illustration})`,
                transform: `scale(${ILLUSTRATION_SCALE})`,
              }}
            />
            <div className="absolute inset-x-0 bottom-0 z-0 h-2/3 bg-linear-to-t from-card via-card/70 to-transparent" />
          </>
        )}

        <div className={`relative z-10 flex flex-1 flex-col items-start gap-1 ${bodyPaddingClass}`}>
          {hasProductions && productions && (
            <div data-tour="card-production">
              <ResourceChoice
                onSelect={choosenOption => resolveProduction(instance.id, choosenOption)}
                options={productions}
                disabled={!canActivate || !isOnBoard || isBlocked}
                pillClassName={pillSizeClass}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {cs.glory !== undefined && (cs.glory.amount !== 0 || cs.glory.valuePerElement) && (
              <Glory glory={glory} className={glorySizeClass} />
            )}
            {emptyValues.map((value, i) => (
              <Glory key={`empty-${i.toString()}`} glory={value} className={glorySizeClass} />
            ))}
          </div>

          {currentStateStickers.length > 0 && (
            <div className="flex items-center gap-1 justify-start w-full">
              {currentStateStickers.map((stickerId, index) => {
                const sticker = stickerDefs[stickerId];
                if (!sticker) return null;
                return (
                  <StickerDisplay key={`${stickerId}-${index.toString()}`} sticker={sticker} />
                );
              })}
            </div>
          )}
        </div>

        <div className={`relative z-10 flex flex-col items-center gap-1 ${bodyPaddingClass}`}>
          {(cs.glory?.condition ?? cs.glory?.valuePerElement) && (
            <span className={cardActionsClass}>
              <PassifIcon className={passifIconClass} /> {tCardGloryLabel(t, def.id, cs.id)}
            </span>
          )}
          {(cs.passives ?? []).map(passive => (
            <span key={passive.id} className={cardActionsClass} data-tour="card-passive">
              <PassifIcon className={passifIconClass} />{' '}
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
                  size={size}
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
                  <UpgradeIcon className="size-4" />{' '}
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
                                  className={`${resourceIconClass} align-middle`}
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

  if (!allowTilt) return content;

  return (
    <Tilt
      className="flex h-full w-full flex-col"
      tiltMaxAngleX={CARD_TILT_MAX_DEG}
      tiltMaxAngleY={CARD_TILT_MAX_DEG}
      perspective={CARD_TILT_PERSPECTIVE}
      scale={1.04}
      transitionSpeed={400}
      glareEnable={false}
      onMove={handleIllustrationTiltMove}
      onLeave={resetIllustrationTilt}
    >
      {content}
    </Tilt>
  );
}
