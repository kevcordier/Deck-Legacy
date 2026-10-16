import { CardViewerModal } from '@components/CardViewerModal/CardViewerModal';
import { GameCard, WIDE_CARD_MIN_WIDTH } from '@components/GameCard/GameCard';
import { MiniGameCard } from '@components/MiniGameCard/MiniGameCard';
import { Button } from '@components/ui/Button/Button';
import { Divider } from '@components/ui/Divider/Divider';
import { Grid } from '@components/ui/Grid/Grid';
import { SelectInput } from '@components/ui/Input/SelectInput';
import { TextInput } from '@components/ui/Input/TextInput';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { Title } from '@components/ui/Title/Title';
import { getActiveState } from '@deck-legacy/engine/application/cardHelpers';
import type { CardTag } from '@deck-legacy/engine/domain/enums';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { tCardTag } from '@helpers/cardI18n';
import { useGame } from '@hooks/useGame';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

type CardListFilter = {
  search: string;
  tag: string;
};

type DeckViewerProps = {
  readonly title: string;
  readonly icon: ReactNode;
  readonly emptyText?: string;
  readonly deck: CardInstance[];
  readonly displayedCards?: CardInstance[];
  readonly variant?: 'full' | 'left' | 'right';
  readonly footer?: ReactNode;
  readonly deckName?: 'draw' | 'discard' | 'destroyed';
  /** Cards of the pile under the displayed ones, drawn as a stack under the last card. */
  readonly stackCount?: number;
};

/** One stacked card shows under the top card per this many cards in the pile. */
const CARDS_PER_STACK_LAYER = 4;
const MAX_STACK_LAYERS = 10;
/** Offset between two stacked cards (px). */
const STACK_LAYER_VERTICAL_OFFSET = 3;
const STACK_LAYER_HORIZONTAL_OFFSET = 1;

/** A card with the rest of its pile peeking out underneath: thicker as the pile grows. */
function StackedCard({
  instance,
  stackCount,
  onPress,
}: {
  readonly instance: CardInstance;
  readonly stackCount: number;
  readonly onPress: () => void;
}) {
  const [width, setWidth] = useState(0);
  const layers = Math.min(MAX_STACK_LAYERS, Math.ceil(stackCount / CARDS_PER_STACK_LAYER));
  // Same corners as the card on top, which rounds more once wide.
  const rounded = width >= WIDE_CARD_MIN_WIDTH ? 'rounded-xl' : 'rounded-md';
  return (
    <View
      className="w-full max-w-80"
      style={{
        paddingBottom: layers * STACK_LAYER_VERTICAL_OFFSET,
        paddingRight: layers * STACK_LAYER_HORIZONTAL_OFFSET,
      }}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      {Array.from({ length: layers }, (_, i) => layers - i).map(depth => (
        <View
          key={depth}
          className={`bg-card border-border absolute inset-x-0 border ${rounded}`}
          style={{
            top: depth * STACK_LAYER_VERTICAL_OFFSET,
            bottom: (layers - depth) * STACK_LAYER_VERTICAL_OFFSET,
            left: depth * STACK_LAYER_HORIZONTAL_OFFSET,
            right: (layers - depth) * STACK_LAYER_HORIZONTAL_OFFSET,
          }}
        />
      ))}
      <GameCard instance={instance} onPress={onPress} />
    </View>
  );
}

/**
 * Top cards of a pile, the last one stacked on the rest: in a column (side column) or a `row`
 * (phone board). A tap zooms the card; the viewer only steps through the cards shown.
 */
export function PileTop({
  cards,
  stackCount,
  row = false,
}: {
  readonly cards: CardInstance[];
  readonly stackCount: number;
  readonly row?: boolean;
}) {
  const [viewerCardId, setViewerCardId] = useState<number | null>(null);
  return (
    <View className={row ? 'flex-row items-start justify-center gap-2' : 'items-center gap-2 p-2'}>
      {cards.map((inst, index) => {
        const open = () => setViewerCardId(inst.id);
        const card =
          index === cards.length - 1 ? (
            <StackedCard instance={inst} stackCount={stackCount} onPress={open} />
          ) : (
            <GameCard instance={inst} onPress={open} />
          );
        return row ? (
          <View key={inst.id} className="max-w-56 flex-1">
            {card}
          </View>
        ) : (
          <View key={inst.id} className="w-full items-center">
            {card}
          </View>
        );
      })}
      {viewerCardId !== null && (
        <CardViewerModal
          cardIds={cards.map(inst => inst.id)}
          initialId={viewerCardId}
          onClose={() => setViewerCardId(null)}
        />
      )}
    </View>
  );
}

/**
 * Cards of the full list (side sheets). Desktop: up to four columns; phone: mini cards, at least two per
 * row. A tap opens the card in large; the viewer steps through the list in its order.
 */
export function DeckCardGrid({ cards }: { readonly cards: CardInstance[] }) {
  const isDesktop = useIsDesktop();
  const [viewerCardId, setViewerCardId] = useState<number | null>(null);

  return (
    <>
      {isDesktop ? (
        <Grid minItemWidth={200} maxColumns={4}>
          {cards.map(inst => (
            <GameCard key={inst.id} instance={inst} onPress={() => setViewerCardId(inst.id)} />
          ))}
        </Grid>
      ) : (
        <Grid minItemWidth={140} maxColumns={4} gap={8}>
          {cards.map(inst => (
            <MiniGameCard key={inst.id} instance={inst} onPress={() => setViewerCardId(inst.id)} />
          ))}
        </Grid>
      )}
      {viewerCardId !== null && (
        <CardViewerModal
          cardIds={cards.map(inst => inst.id)}
          initialId={viewerCardId}
          onClose={() => setViewerCardId(null)}
        />
      )}
    </>
  );
}

/** `DeckCardGrid` under a search field and a tag filter (tags of the given cards only). */
export function FilterableCardGrid({ cards }: { readonly cards: CardInstance[] }) {
  const { defs } = useGame();
  const { t } = useTranslation();
  const [cardFilter, setCardFilter] = useState<CardListFilter>({ search: '', tag: '' });

  const cardFilterFn = (inst: CardInstance) => {
    const cs = getActiveState(inst, defs);
    return (
      t(`names.${cs.name}`, { ns: 'cards' })
        ?.toString()
        .toLowerCase()
        .includes(cardFilter.search.toLowerCase()) &&
      (cardFilter.tag === '' || cs.tags?.includes(cardFilter.tag as CardTag))
    );
  };

  const filteredCards = cards.filter(cardFilterFn);

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

  return (
    <>
      <View className="gap-4 py-4 sm:flex-row sm:items-center">
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
      </View>
      <Divider color="gradient" orientation="horizontal" className="my-4" />
      <DeckCardGrid cards={filteredCards} />
    </>
  );
}

export function DeckViewer({
  title,
  icon,
  emptyText,
  deck,
  displayedCards,
  variant = 'full',
  footer,
  deckName,
  stackCount = 0,
}: DeckViewerProps) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const isLeft = variant === 'left';

  const content = (
    <>
      <View
        className={`border-b-border min-h-11 items-center justify-between gap-2 border-b p-2 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
      >
        <View className="shrink flex-row items-center gap-2">
          <Title level={4}>
            {icon}
            {` ${title} (${deck.length})`}
          </Title>
          {deck.length > 1 && (
            <Button onPress={() => setModalOpen(true)} size="xs" variant="text" color="ink">
              {t('deckViewer.viewAll')}
            </Button>
          )}
        </View>
      </View>

      {deck.length > 0
        ? displayedCards &&
          displayedCards.length > 0 && <PileTop cards={displayedCards} stackCount={stackCount} />
        : emptyText && (
            <Text className="text-ink/50 font-body-italic p-2 text-center text-sm">
              {emptyText}
            </Text>
          )}
    </>
  );

  return (
    <View className="bg-background w-full flex-1">
      {variant === 'full' ? content : <ScrollView>{content}</ScrollView>}
      {footer && <View className="border-t-border mt-auto border-t p-2">{footer}</View>}

      {modalOpen && (
        <Modal
          title={t('deckViewer.title')}
          subtitle={t('deckViewer.modalSubtitle', { count: deck.length })}
          onClose={() => setModalOpen(false)}
          label={deckName}
          // The draw pile slides in from the left, the discard (and destroyed) piles from the right.
          side={deckName === 'draw' ? 'left' : 'right'}
        >
          {deck.length === 0 ? (
            <Text className="text-ink/50 font-body-italic p-2 text-center text-sm">
              {t('deckViewer.emptyDeck')}
            </Text>
          ) : (
            <FilterableCardGrid cards={deck} />
          )}
        </Modal>
      )}
    </View>
  );
}
