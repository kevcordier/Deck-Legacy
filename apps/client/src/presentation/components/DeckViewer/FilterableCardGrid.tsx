import { DeckCardGrid } from './DeckCardGrid';
import { Button } from '@components/ui/Button/Button';
import { Divider } from '@components/ui/Divider/Divider';
import { ChevronDownIcon } from '@components/ui/Icon/icons/ChevronDownIcon';
import { SelectInput } from '@components/ui/Input/SelectInput';
import { TextInput } from '@components/ui/Input/TextInput';
import { Text } from '@components/ui/Text/Text';
import {
  getActiveState,
  getEffectiveGlory,
  getProductionChoicesForAction,
} from '@deck-legacy/engine/application/cardHelpers';
import { type CardTag, PassiveType, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { useGame } from '@hooks/useGame';
import { tCardTag } from '@i18n/card/tCardTag';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type CardListFilter = {
  search: string;
  tag: string;
  side: 'all' | 'ally' | 'enemy';
  minGlory: string;
  maxGlory: string;
  resource: '' | ResourceType;
  feature: '' | CardFeature;
  stayInPlay: TriState;
  stickers: TriState;
  /** '' = every card, 'base' = base game only, otherwise an expansion name. */
  expansion: string;
};

type TriState = 'all' | 'yes' | 'no';

type CardFeature = 'action' | 'trigger' | 'track' | 'passive';

const matchesTriState = (filter: TriState, value: boolean) =>
  filter === 'all' || value === (filter === 'yes');

type CardSort = 'pile' | 'expansion' | 'number' | 'name' | 'glory';

const EMPTY_FILTER: CardListFilter = {
  search: '',
  tag: '',
  side: 'all',
  minGlory: '',
  maxGlory: '',
  resource: '',
  feature: '',
  stayInPlay: 'all',
  stickers: 'all',
  expansion: '',
};

/**
 * `DeckCardGrid` under a search field, a tag filter (tags of the given cards only) and a sort; more
 * filters (ally / enemy, glory range, production, features, stay in play, stickers, expansion)
 * behind a toggle.
 */
export function FilterableCardGrid({
  cards,
  hiddenOrder = false,
}: {
  readonly cards: CardInstance[];
  /** Secret pile order (draw pile): no "pile order" sort, the cards are sorted by number. */
  readonly hiddenOrder?: boolean;
}) {
  const { defs, gameState, stickerDefs } = useGame();
  const { t } = useTranslation();
  const [cardFilter, setCardFilter] = useState<CardListFilter>(EMPTY_FILTER);
  const [sort, setSort] = useState<CardSort>(hiddenOrder ? 'number' : 'pile');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const rows = cards.map(inst => {
    const cs = getActiveState(inst, defs);
    const actions = cs.actions ?? [];
    // Same sources as the card's production pills (base production + stickers).
    const productions =
      cs.productions?.flatMap(base =>
        getProductionChoicesForAction(base, gameState, defs, inst, stickerDefs),
      ) ?? getProductionChoicesForAction({}, gameState, defs, inst, stickerDefs);
    const features: Record<CardFeature, boolean> = {
      action: actions.some(action => !action.trigger),
      trigger: actions.some(action => action.trigger),
      track: cs.track !== undefined,
      passive: cs.passives?.some(p => p.type !== PassiveType.STAY_IN_PLAY) ?? false,
    };
    return {
      inst,
      cs,
      name: t(`names.${cs.name}`, { ns: 'cards' }).toString(),
      glory: getEffectiveGlory(cs, gameState, defs, inst, stickerDefs),
      produces: (res: ResourceType) => productions.some(prod => Number(prod[res] ?? 0) > 0),
      features,
      stayInPlay: cs.passives?.some(p => p.type === PassiveType.STAY_IN_PLAY) ?? false,
      hasStickers: (inst.stickers[inst.stateId] ?? []).length > 0,
    };
  });

  // An empty or non-numeric bound does not filter.
  const minGlory = Number.parseInt(cardFilter.minGlory, 10);
  const maxGlory = Number.parseInt(cardFilter.maxGlory, 10);
  const filteredRows = rows.filter(
    ({ inst, cs, name, glory, produces, features, stayInPlay, hasStickers }) =>
      name.toLowerCase().includes(cardFilter.search.toLowerCase()) &&
      (cardFilter.tag === '' || cs.tags?.includes(cardFilter.tag as CardTag)) &&
      (cardFilter.side === 'all' || (cs.negative === true) === (cardFilter.side === 'enemy')) &&
      (Number.isNaN(minGlory) || glory >= minGlory) &&
      (Number.isNaN(maxGlory) || glory <= maxGlory) &&
      (cardFilter.resource === '' || produces(cardFilter.resource)) &&
      (cardFilter.feature === '' || features[cardFilter.feature]) &&
      matchesTriState(cardFilter.stayInPlay, stayInPlay) &&
      matchesTriState(cardFilter.stickers, hasStickers) &&
      (cardFilter.expansion === '' || (inst.expansion ?? 'base') === cardFilter.expansion),
  );
  const isFiltered = JSON.stringify(cardFilter) !== JSON.stringify(EMPTY_FILTER);

  type Row = (typeof rows)[number];
  const byNumber = (a: CardInstance, b: CardInstance) => a.cardId - b.cardId;
  const compare: Record<Exclude<CardSort, 'pile'>, (a: Row, b: Row) => number> = {
    // Base game first, then each expansion by its printed number.
    expansion: (a, b) =>
      (a.inst.expansion ?? '').localeCompare(b.inst.expansion ?? '') ||
      (a.inst.expansionId ?? a.inst.cardId) - (b.inst.expansionId ?? b.inst.cardId),
    number: (a, b) => byNumber(a.inst, b.inst),
    name: (a, b) => a.name.localeCompare(b.name) || byNumber(a.inst, b.inst),
    glory: (a, b) => b.glory - a.glory || byNumber(a.inst, b.inst),
  };
  const sortedRows = sort === 'pile' ? filteredRows : [...filteredRows].sort(compare[sort]);

  const tagOptions = [
    { label: t('cardList.allTags'), value: '' },
    ...cards
      .reduce<string[]>((acc, inst) => {
        const cs = getActiveState(inst, defs);
        cs.tags?.forEach(tag => {
          if (!acc.includes(tag)) acc.push(tag);
        });
        return acc;
      }, [])
      .map(value => ({ label: tCardTag(t, value), value }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];
  const sortOptions = (['pile', 'expansion', 'number', 'name', 'glory'] as const)
    .filter(value => !hiddenOrder || value !== 'pile')
    .map(value => ({
      label: t(`cardList.sort.${value}`),
      value,
    }));
  const resourceOptions = [
    { label: t('cardList.allResources'), value: '' as const },
    ...Object.values(ResourceType).map(value => ({ label: t(`resources.${value}`), value })),
  ];
  const featureOptions = [
    { label: t('cardList.feature.all'), value: '' as const },
    ...(['action', 'trigger', 'track', 'passive'] as const).map(value => ({
      label: t(`cardList.feature.${value}`),
      value,
    })),
  ];
  const triStateOptions = (key: 'stayInPlay' | 'stickers') =>
    (['all', 'yes', 'no'] as const).map(value => ({
      label: t(`cardList.${key}.${value}`),
      value,
    }));
  const expansions = [...new Set(cards.flatMap(inst => inst.expansion ?? []))];
  const expansionOptions = [
    { label: t('cardList.allExpansions'), value: '' },
    { label: t('cardList.baseGame'), value: 'base' },
    ...expansions.map(value => ({ label: t(`campaign.expansions.${value}.title`), value })),
  ];
  const sideOptions = (['all', 'ally', 'enemy'] as const).map(value => ({
    label: t(`cardList.side.${value}`),
    value,
  }));

  return (
    <>
      <View className="gap-2 py-2 sm:flex-row sm:flex-wrap sm:items-center">
        <TextInput
          value={cardFilter.search}
          onChangeText={search => setCardFilter({ ...cardFilter, search })}
          placeholder={t('cardList.searchPlaceholder')}
          className="sm:flex-1"
        />
        <SelectInput
          value={cardFilter.tag}
          onChange={tag => setCardFilter({ ...cardFilter, tag })}
          options={tagOptions}
          className="sm:w-56"
        />
        <SelectInput value={sort} onChange={setSort} options={sortOptions} className="sm:w-56" />
      </View>
      <View className="flex-row flex-wrap items-center gap-2">
        <Button
          onPress={() => setShowMoreFilters(!showMoreFilters)}
          size="xs"
          variant="text"
          color="ink"
          accessibilityState={{ expanded: showMoreFilters }}
        >
          <Text className="text-ink font-display text-xs font-semibold">
            {t(showMoreFilters ? 'cardList.lessFilters' : 'cardList.moreFilters')}
          </Text>
          <ChevronDownIcon className={`text-ink size-3 ${showMoreFilters ? 'rotate-180' : ''}`} />
        </Button>
        {isFiltered && (
          <Button onPress={() => setCardFilter(EMPTY_FILTER)} size="xs" variant="text" color="ink">
            {t('cardList.resetFilters')}
          </Button>
        )}
      </View>
      {showMoreFilters && (
        <View className="gap-2 py-2 sm:flex-row sm:flex-wrap sm:items-center">
          <SelectInput
            value={cardFilter.resource}
            onChange={resource => setCardFilter({ ...cardFilter, resource })}
            options={resourceOptions}
            className="sm:w-56"
          />
          <SelectInput
            value={cardFilter.feature}
            onChange={feature => setCardFilter({ ...cardFilter, feature })}
            options={featureOptions}
            className="sm:w-56"
          />
          <SelectInput
            value={cardFilter.stayInPlay}
            onChange={stayInPlay => setCardFilter({ ...cardFilter, stayInPlay })}
            options={triStateOptions('stayInPlay')}
            className="sm:w-56"
          />
          <SelectInput
            value={cardFilter.stickers}
            onChange={stickers => setCardFilter({ ...cardFilter, stickers })}
            options={triStateOptions('stickers')}
            className="sm:w-56"
          />
          {expansions.length > 0 && (
            <SelectInput
              value={cardFilter.expansion}
              onChange={expansion => setCardFilter({ ...cardFilter, expansion })}
              options={expansionOptions}
              className="sm:w-56"
            />
          )}
          <SelectInput
            value={cardFilter.side}
            onChange={side => setCardFilter({ ...cardFilter, side })}
            options={sideOptions}
            className="sm:w-56"
          />
          <View className="flex-row items-center gap-2">
            <Text className="text-ink">{t('cardList.glory')}</Text>
            <TextInput
              value={cardFilter.minGlory}
              onChangeText={minGlory => setCardFilter({ ...cardFilter, minGlory })}
              placeholder={t('cardList.min')}
              accessibilityLabel={t('cardList.minGlory')}
              keyboardType="numbers-and-punctuation"
              className="w-20"
            />
            <Text className="text-ink">–</Text>
            <TextInput
              value={cardFilter.maxGlory}
              onChangeText={maxGlory => setCardFilter({ ...cardFilter, maxGlory })}
              placeholder={t('cardList.max')}
              accessibilityLabel={t('cardList.maxGlory')}
              keyboardType="numbers-and-punctuation"
              className="w-20"
            />
          </View>
        </View>
      )}
      <Divider color="gradient" orientation="horizontal" className="my-2" />
      <DeckCardGrid cards={sortedRows.map(row => row.inst)} />
    </>
  );
}
