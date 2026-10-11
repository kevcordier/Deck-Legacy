import { CardAction } from '@components/CardAction/CardAction';
import { CardStatePreview } from '@components/CardStatePreview/CardStatePreview';
import { CardIllustration } from '@components/CardTilt/CardIllustration';
import { CardTrack } from '@components/CardTrack/CardTrack';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Glory } from '@components/ui/Glory/Glory';
import { HoverPressable } from '@components/ui/HoverPressable/HoverPressable';
import { PassifIcon, UpgradeIcon } from '@components/ui/Icon/icon';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { StickerDisplay } from '@components/ui/StickerDisplay/StickerDisplay';
import { Tag } from '@components/ui/Tag/Tag';
import { Text, TextStyle } from '@components/ui/Text/Text';
import {
  canAffordCost,
  cardIsBlocked,
  getActiveState,
  getEffectiveGlory,
  getEffectiveUpgradeCost,
  getProductionChoicesForAction,
  tagClass,
} from '@deck-legacy/engine/application/cardHelpers';
import { getPickNumbers } from '@deck-legacy/engine/application/effectResolver';
import { canUseOptions } from '@deck-legacy/engine/application/gameStateHelper';
import { Options } from '@deck-legacy/engine/domain/enums';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import {
  tCardActionLabel,
  tCardGloryLabel,
  tCardName,
  tCardPassiveLabel,
  tCardTag,
} from '@helpers/cardI18n';
import { catalog } from '@helpers/catalog';
import { ExpansionIcon, expansionOfInstance } from '@helpers/expansionIcon';
import { getIllustrationSource } from '@helpers/illustrations';
import { getResMeta } from '@helpers/renderHelpers';
import { useGame } from '@hooks/useGame';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type ImageSourcePropType, Pressable, TextInput, View } from 'react-native';

export type GameCardSize = 'md' | 'lg';

interface GameCardProps {
  readonly instance: CardInstance;
  readonly hideStatePreview?: boolean;
  readonly isOnBoard?: boolean;
  readonly className?: string;
  readonly size?: GameCardSize;
  /** Removes the default 320px max width (e.g. in the card viewer). */
  readonly unconstrained?: boolean;
  /** Registers the card parts as tutorial targets (first card of the board only). */
  readonly tourTarget?: boolean;
  /** Called when the card itself (not one of its controls) is pressed. */
  readonly onPress?: () => void;
  /** Called after a production / action / upgrade has been triggered from this card. */
  readonly onActionTriggered?: () => void;
}

/** Card width (px) from which a medium card uses its roomier layout (former `@3xs` container query). */
export const WIDE_CARD_MIN_WIDTH = 256;
const CARD_COLOR = '#f0e4be';

function getSizeClasses(size: GameCardSize, wide: boolean) {
  if (size === 'lg') {
    return {
      actionBox: 'bg-white/60 p-2 rounded-md',
      actionText: 'text-base',
      header: 'p-3 gap-2',
      nameText: 'text-lg',
      body: 'p-3',
      pill: 'size-8',
      glory: 'size-14',
      gloryText: 'text-base',
      passifIcon: 'size-6',
      resourceIcon: 'size-6',
      tagText: 'text-base',
      tagBox: 'px-2 py-1',
      expansionIcon: 'size-7',
    };
  }
  if (wide) {
    return {
      actionBox: 'bg-white/60 p-2 rounded-md',
      actionText: 'text-xs',
      header: 'px-3 py-2 gap-2',
      nameText: 'text-base',
      body: 'p-2',
      pill: 'size-6',
      glory: 'size-10',
      gloryText: 'text-sm',
      passifIcon: 'size-6',
      resourceIcon: 'size-4',
      tagText: 'text-base',
      tagBox: '',
      expansionIcon: 'size-5',
    };
  }
  return {
    actionBox: 'bg-white/60 p-1 rounded-md',
    actionText: 'text-xs',
    header: 'p-1 gap-1',
    nameText: 'text-xs leading-tight',
    body: 'p-1',
    pill: 'size-4',
    glory: 'size-8',
    gloryText: 'text-xs',
    passifIcon: 'size-3',
    resourceIcon: 'size-4',
    tagText: 'text-xs',
    tagBox: '',
    expansionIcon: 'size-4',
  };
}

/** The illustration fills the card body, under the header, and fades into the card colour. */
function CardBackground({ source }: { readonly source?: ImageSourcePropType }) {
  if (!source) return null;
  return (
    <>
      <CardIllustration source={source} />
      <LinearGradient
        colors={['transparent', 'rgba(240, 228, 190, 0.7)', CARD_COLOR]}
        className="absolute inset-x-0 bottom-0 h-2/3"
      />
    </>
  );
}

export function GameCard({
  instance,
  hideStatePreview = false,
  isOnBoard = false,
  className = '',
  size = 'md',
  unconstrained = false,
  tourTarget = false,
  onPress,
  onActionTriggered,
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
  const [width, setWidth] = useState(0);
  const [name, setName] = useState(() => getCardName(instance.id));
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
  const illustration = getIllustrationSource(cs.illustration);
  const expansion = expansionOfInstance(instance.id, catalog.expansions);
  const tourId = (id: string) => (tourTarget ? id : undefined);

  const emptyGloryBlock =
    (cs.glory?.emptyValues ?? 0) +
    (currentStateStickers?.reduce(
      (sum, stickerId) => sum + (stickerDefs[stickerId]?.additionalGlory ?? 0),
      0,
    ) ?? 0);
  const emptyValues: (number | undefined)[] = Array.from({
    length: emptyGloryBlock,
  }).map((_, i) => instance.glories[i]);

  const sizes = getSizeClasses(size, width >= WIDE_CARD_MIN_WIDTH);

  const withCallback =
    <A extends unknown[]>(fn: (...args: A) => void) =>
    (...args: A) => {
      fn(...args);
      onActionTriggered?.();
    };

  return (
    <TutorialTarget
      id={tourId('card-root')}
      className={`w-full min-w-32 ${unconstrained ? '' : 'max-w-80'} ${className}`}
    >
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        onLayout={event => setWidth(event.nativeEvent.layout.width)}
        style={{ aspectRatio: 3 / 5 }}
        className={`bg-card relative w-full justify-between overflow-hidden border-[3px] shadow-lg ${size === 'lg' || width >= WIDE_CARD_MIN_WIDTH ? 'rounded-xl' : 'rounded-md'} ${isPermanent ? 'border-permanent border-t-4' : 'border-black/5'}`}
      >
        <TextStyle className="text-base-ink font-body">
          <View className={`border-b border-black/10 bg-black/5 ${sizes.header}`}>
            <View className="flex-row items-start justify-between gap-2">
              <View className="min-w-0 shrink flex-row flex-wrap items-center gap-1">
                {expansion && (
                  <ExpansionIcon
                    expansion={expansion}
                    className={sizes.expansionIcon}
                    alt={t(`campaign.expansions.${expansion}.title`)}
                  />
                )}
                {instance.id !== 0 && (
                  <TutorialTarget
                    id={tourId('card-number')}
                    className="mr-1 rounded bg-black/5 px-1"
                  >
                    <Text className={`font-body-bold ${sizes.nameText}`}>#{instance.id}</Text>
                  </TutorialTarget>
                )}
                <TutorialTarget id={tourId('card-name')} className="min-w-0 shrink">
                  {canChooseName ? (
                    <View className="flex-row flex-wrap items-baseline gap-1">
                      <Text className={`font-display ${sizes.nameText}`}>{namePrefix}</Text>
                      <TextInput
                        value={name ?? ''}
                        onChangeText={setName}
                        onBlur={() => setCardName(instance.id, name ?? '')}
                        className={`text-base-ink font-display min-w-8 flex-1 p-0 ${sizes.nameText} ${name ? '' : 'border-base-ink border-b'}`}
                        accessibilityLabel={t('card.name')}
                      />
                      <Text className={`font-display ${sizes.nameText}`}>{nameSuffix}</Text>
                    </View>
                  ) : (
                    <Text
                      className={`font-display ${sizes.nameText} ${isEnemy ? 'text-tag-enemy' : ''}`}
                    >
                      {tCardName(t, cs.name || '')}
                    </Text>
                  )}
                </TutorialTarget>
              </View>
              {!hideStatePreview && (
                <TutorialTarget id={tourId('card-state-preview')}>
                  <CardStatePreview
                    instance={instance}
                    defs={defs}
                    renderCard={i => <GameCard instance={i} hideStatePreview />}
                  />
                </TutorialTarget>
              )}
            </View>

            <TutorialTarget
              id={tourId('card-tags')}
              className="flex-row flex-wrap items-center gap-1"
            >
              {(cs.tags ?? []).map(tag => (
                <Tag
                  key={tag}
                  label={tCardTag(t, tag)}
                  className={`${tagClass(tag, isEnemy)} ${sizes.tagBox}`}
                  textClassName={sizes.tagText}
                />
              ))}
            </TutorialTarget>
          </View>

          <View className="relative flex-1 overflow-hidden">
            <CardBackground source={illustration} />
            <View className={`relative z-10 flex-1 items-start gap-1 ${sizes.body}`}>
              {hasProductions && productions && (
                <TutorialTarget id={tourId('card-production')}>
                  <ResourceChoice
                    onSelect={withCallback(choosenOption =>
                      resolveProduction(instance.id, choosenOption),
                    )}
                    options={productions}
                    disabled={!canActivate}
                    pillClassName={sizes.pill}
                  />
                </TutorialTarget>
              )}

              <View className="flex-row flex-wrap gap-1">
                {cs.glory !== undefined && (cs.glory.amount !== 0 || cs.glory.valuePerElement) && (
                  <Glory glory={glory} className={sizes.glory} textClassName={sizes.gloryText} />
                )}
                {emptyValues.map((value, i) => (
                  <Glory
                    key={`empty-${i.toString()}`}
                    glory={value}
                    className={sizes.glory}
                    textClassName={sizes.gloryText}
                  />
                ))}
              </View>

              {currentStateStickers.length > 0 && (
                <View className="w-full flex-row flex-wrap items-center justify-start gap-1">
                  {currentStateStickers.map((stickerId, index) => {
                    const sticker = stickerDefs[stickerId];
                    if (!sticker) return null;
                    return (
                      <StickerDisplay
                        key={`${stickerId}-${index.toString()}`}
                        sticker={sticker}
                        large={size === 'lg'}
                      />
                    );
                  })}
                </View>
              )}
            </View>

            <View className={`relative z-10 items-center gap-1 ${sizes.body}`}>
              {(cs.glory?.condition ?? cs.glory?.valuePerElement) && (
                <View className={sizes.actionBox}>
                  <Text className={sizes.actionText}>
                    <PassifIcon className={sizes.passifIcon} /> {tCardGloryLabel(t, def.id, cs.id)}
                  </Text>
                </View>
              )}
              {(cs.passives ?? []).map(passive => (
                <View key={passive.id} className={sizes.actionBox}>
                  <Text className={sizes.actionText}>
                    <PassifIcon className={sizes.passifIcon} />{' '}
                    {tCardPassiveLabel(t, passive.id, instance.cumulated)}
                  </Text>
                </View>
              ))}

              {!isBlocked &&
                !isParchment &&
                actions.map((action, index) => (
                  <CardAction
                    key={action.id}
                    instance={instance}
                    action={action}
                    actionLabel={tCardActionLabel(t, action.id, instance.cumulated)}
                    disabled={!canActivate}
                    size={size}
                    wide={width >= WIDE_CARD_MIN_WIDTH}
                    tourTarget={tourTarget && index === 0}
                    onTriggered={onActionTriggered}
                  />
                ))}

              {!isBlocked && cs.track && (
                <CardTrack
                  instance={instance}
                  track={cs.track}
                  validatedSteps={instance.trackProgress}
                  wide={size === 'lg' || width >= WIDE_CARD_MIN_WIDTH}
                />
              )}

              {!isBlocked &&
                upgrades.map((upg, index) => {
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
                  const disabled = !affordable || !canActivate || optionDisabled;

                  return (
                    <TutorialTarget
                      key={upg.upgradeTo}
                      id={index === 0 ? tourId('card-upgrade') : undefined}
                    >
                      <HoverPressable
                        onPress={withCallback(() => resolveUpgrade(instance.id, upg.upgradeTo))}
                        disabled={disabled}
                        accessibilityRole="button"
                        accessibilityState={{ disabled }}
                        className={`${sizes.actionBox} active:bg-base-ink/20 ${disabled ? 'opacity-50' : ''}`}
                      >
                        <Text className={sizes.actionText}>
                          <UpgradeIcon className="size-4" />{' '}
                          {targetState
                            ? tCardName(t, targetState.name || '')
                            : t('card.state', { id: upg.upgradeTo })}
                          {Boolean(
                            effectiveUpgradeCost.resources?.[0] ?? discardLabel ?? destroyLabel,
                          ) && (
                            <Text>
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
                                          className={sizes.resourceIcon}
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
                            </Text>
                          )}
                        </Text>
                      </HoverPressable>
                    </TutorialTarget>
                  );
                })}
            </View>
          </View>
        </TextStyle>
      </Pressable>
    </TutorialTarget>
  );
}
